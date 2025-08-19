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

    if (!Deno.env.get('GEMINI_API_KEY')) {
      return new Response(JSON.stringify({ 
        error: "Configura la chiave API Gemini nelle impostazioni." 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse form data for audio file
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    const consegna = formData.get('consegna') as string || "Presentati in due minuti.";
    const user_id = formData.get('user_id') as string;

    if (!audioFile) {
      return new Response(JSON.stringify({ 
        error: "File audio mancante." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Limite versione gratuita
    if (user_id) {
      const lim = await checkAndIncDailyLimit(user_id, "orale", 1);
      if (!lim.allowed) {
        return new Response(JSON.stringify({ 
          error: "Limite giornaliero raggiunto nella versione gratuita. Passa al piano Premium per accesso illimitato." 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 1) Upload audio to Supabase Storage and get signed URL
    const supabase = createSupabaseClient();
    const audioBuffer = await audioFile.arrayBuffer();
    const filename = `demo_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`;
    
    // Ensure bucket exists
    try {
      await supabase.storage.createBucket('temp_audio', { public: false });
    } catch (error) {
      // Bucket might already exist, ignore error
    }
    
    // Upload audio file
    const { error: uploadError } = await supabase.storage
      .from('temp_audio')
      .upload(filename, audioBuffer, {
        contentType: 'audio/webm',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ 
        error: "Errore nel caricamento del file audio." 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get signed URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from('temp_audio')
      .createSignedUrl(filename, 600); // 10 minutes
    
    if (signedError || !signedData?.signedUrl) {
      console.error('Signed URL error:', signedError);
      return new Response(JSON.stringify({ 
        error: "Errore nella generazione dell'URL del file." 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2) Call HuggingFace ASR (Gradio API)
    const hfUrl = Deno.env.get('HF_ASR_URL');
    if (!hfUrl) {
      return new Response(JSON.stringify({ 
        error: "Configura HF_ASR_URL nelle impostazioni." 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const hfHeaders: Record<string, string> = { 
      'Content-Type': 'application/json' 
    };
    if (Deno.env.get('HF_API_KEY')) {
      hfHeaders['Authorization'] = `Bearer ${Deno.env.get('HF_API_KEY')}`;
    }

    // Start transcription job
    const transcribeResponse = await fetch(hfUrl, {
      method: 'POST',
      headers: hfHeaders,
      body: JSON.stringify({
        data: [
          { 
            path: signedData.signedUrl, 
            meta: { _type: "gradio.FileData" } 
          }
        ]
      })
    });

    if (!transcribeResponse.ok) {
      return new Response(JSON.stringify({ 
        error: "Servizio di trascrizione non disponibile." 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const transcribeData = await transcribeResponse.json();
    let eventId = transcribeData?.event_id || "";
    
    // Try to extract event ID from response
    if (!eventId && typeof transcribeData === 'string') {
      const match = transcribeData.match(/[a-f0-9\-]{8,}/i);
      eventId = match ? match[0] : "";
    }
    
    if (!eventId) {
      return new Response(JSON.stringify({ 
        error: "Impossibile ottenere EVENT_ID dal servizio di trascrizione." 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Poll for results
    const basePollUrl = hfUrl.replace(/\/call\/predict$/, '/call/predict');
    let transcript = "";
    const maxAttempts = 30;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const pollResponse = await fetch(`${basePollUrl}/${eventId}`, {
          method: 'GET'
        });
        
        const pollText = await pollResponse.text();
        let pollData;
        
        try {
          pollData = JSON.parse(pollText);
        } catch {
          // Try to extract text from non-JSON response
          const match = pollText.match(/"text"\s*:\s*"([^"]+)"/);
          if (match) {
            transcript = match[1];
            break;
          }
          continue;
        }
        
        const status = pollData?.status || pollData?.stage || "";
        transcript = pollData?.output?.data?.[0]?.text || 
                    pollData?.output?.data?.text || 
                    pollData?.data?.text || 
                    pollData?.transcription || 
                    pollData?.text || "";
        
        if (/COMPLETE|SUCCESS|finished/i.test(status) || transcript) {
          break;
        }
      } catch (error) {
        console.error('Poll attempt failed:', error);
      }
    }

    if (!transcript) {
      return new Response(JSON.stringify({ 
        error: "Trascrizione vuota. Ripeti la registrazione." 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2) Cache
    const cacheKey = makeHashKey("orale", { transcript, consegna });
    const cached = await cacheSelect(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ transcript, evaluation: cached }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3) Valutazione con Gemini
    const MODEL = Deno.env.get('GEMINI_MODEL_TEXT') || "gemini-1.5-flash";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const systemPrompt = `Sei un esaminatore CILS B1 (Produzione Orale). Valuta la TRASCRIZIONE secondo 4 criteri:
1) Adeguatezza e contenuto (0-5)
2) Coerenza e fluidità (0-5)
3) Lessico (0-5)
4) Pronuncia/Intonazione (0-5)
Restituisci SOLO JSON:
{
 "criteri": {"adeguatezza":n,"fluidita":n,"lessico":n,"pronuncia":n},
 "punteggio_totale": n (0-100 su 20),
 "feedback_breve": "…",
 "suggerimenti": ["…","…","…"],
 "frasi_migliorate": ["…","…"]
}
Livello atteso: B1.`;

    const userPrompt = `Compito: ${consegna}
Trascrizione:
<<<
${transcript}
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
    
    return new Response(JSON.stringify({ transcript, evaluation: parsed }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in eval-orale:', error);
    return new Response(JSON.stringify({ 
      error: "Valutazione Orale non disponibile." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});