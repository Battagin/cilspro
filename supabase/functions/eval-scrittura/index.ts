import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility functions
function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

function makeHashKey(prefix: string, payload: object): string {
  const stable = JSON.stringify(payload);
  const hash = Array.from(new TextEncoder().encode(stable))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}:${hash}`;
}

async function cacheSelect(cache_key: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("ai_cache")
    .select("value, created_at, ttl_seconds")
    .eq("cache_key", cache_key)
    .maybeSingle();
    
  if (error || !data) return null;
  
  const ageSec = (Date.now() - new Date(data.created_at).getTime()) / 1000;
  const ttl = data.ttl_seconds ?? Number(Deno.env.get('AI_CACHE_TTL_SECONDS') || '2592000');
  
  if (ageSec > ttl) return null;
  return data.value;
}

async function cacheUpsert(cache_key: string, value: any) {
  const supabase = createSupabaseClient();
  const ttl = Number(Deno.env.get('AI_CACHE_TTL_SECONDS') || '2592000');
  
  await supabase.from("ai_cache").upsert({ 
    cache_key, 
    value, 
    ttl_seconds: ttl 
  });
}

async function checkAndIncDailyLimit(user_id: string, skill: string, maxPerDay = 1) {
  const supabase = createSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  
  const { data, error } = await supabase
    .from("daily_usage")
    .select("count")
    .eq("user_id", user_id)
    .eq("skill", skill)
    .eq("used_on", today)
    .maybeSingle();
    
  const count = data?.count ?? 0;
  if (count >= maxPerDay) return { allowed: false, count };

  const { error: upErr } = await supabase
    .from("daily_usage")
    .upsert({ 
      user_id, 
      skill, 
      used_on: today, 
      count: count + 1 
    }, { 
      onConflict: "user_id,skill,used_on" 
    });
    
  if (upErr) return { allowed: false, count };
  return { allowed: true, count: count + 1 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Metodo non consentito" }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { user_id, text, consegna } = await req.json();

    if (!Deno.env.get('GEMINI_API_KEY')) {
      return new Response(JSON.stringify({ 
        error: "Configura la chiave API Gemini nelle impostazioni." 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!text || !consegna) {
      return new Response(JSON.stringify({ 
        error: "Testo e consegna sono obbligatori." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Limite versione gratuita (1/die)
    if (user_id) {
      const lim = await checkAndIncDailyLimit(user_id, "scrittura", 1);
      if (!lim.allowed) {
        return new Response(JSON.stringify({ 
          error: "Limite giornaliero raggiunto nella versione gratuita. Passa al piano Premium per accesso illimitato." 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Cache
    const cacheKey = makeHashKey("scrittura", { text, consegna });
    const cached = await cacheSelect(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const MODEL = Deno.env.get('GEMINI_MODEL_TEXT') || "gemini-1.5-flash";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const systemPrompt = `Sei un esaminatore CILS B1. Valuta il testo secondo 4 criteri:
1) Adeguatezza alla consegna (0-5)
2) Coesione e organizzazione (0-5)  
3) Lessico e varietà (0-5)
4) Morfosintassi/Strutture (0-5)

Restituisci SOLO JSON:
{
 "criteri": { "adeguatezza":n, "coesione":n, "lessico":n, "strutture":n },
 "punteggio_totale": n (0-100 calcolato su 20),
 "feedback_breve": "…",
 "suggerimenti": ["…","…","…"],
 "errori_tipici": ["…","…"]
}
Livello atteso: B1.`;

    const userPrompt = `Consegna: ${consegna}

Testo candidato:
<<<
${text}
>>>`;

    const response = await fetch(`${GEMINI_URL}?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { 
          responseMimeType: "application/json", 
          temperature: 0.2 
        },
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          },
          {
            role: "user", 
            parts: [{ text: userPrompt }]
          }
        ]
      })
    });

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!raw) {
      return new Response(JSON.stringify({ 
        error: "Risposta IA non valida." 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const parsed = JSON.parse(raw);
    await cacheUpsert(cacheKey, parsed);
    
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in eval-scrittura:', error);
    return new Response(JSON.stringify({ 
      error: "Valutazione IA non disponibile." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});