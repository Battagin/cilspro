import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error('Testo non fornito');
    }

    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount < 80) {
      return new Response(JSON.stringify({
        score: 45,
        criteria: {
          adeguatezza: 40,
          coesione: 45,
          lessico: 50,
          strutture: 45
        },
        feedback: "Il testo è troppo breve. Per il livello B1 è necessario scrivere almeno 90-120 parole. Sviluppa meglio le tue idee.",
        suggestions: ["Aggiungi più dettagli", "Espandi le motivazioni", "Includi esempi concreti"]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Sei un valutatore esperto per l'esame CILS B1 Cittadinanza. Valuta questo testo scritto secondo i criteri CILS per il livello B1:

1. ADEGUATEZZA (0-100): Rispetto della consegna, registro appropriato, contenuto pertinente
2. COESIONE (0-100): Organizzazione del testo, connettori, coerenza logica
3. LESSICO (0-100): Varietà lessicale, appropriatezza, precisione
4. STRUTTURE (0-100): Correttezza grammaticale, varietà sintattica

Restituisci SOLO un JSON valido con questa struttura:
{
  "score": [punteggio medio 0-100],
  "criteria": {
    "adeguatezza": [0-100],
    "coesione": [0-100], 
    "lessico": [0-100],
    "strutture": [0-100]
  },
  "feedback": "[feedback breve e motivante in 1-2 frasi]",
  "suggestions": ["[suggerimento 1]", "[suggerimento 2]", "[suggerimento 3]"]
}`
          },
          {
            role: 'user',
            content: `Valuta questo testo (${wordCount} parole):\n\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    console.log('Writing evaluation:', evaluation);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in evaluate-writing:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      score: 0,
      feedback: "Errore nella valutazione. Riprova."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});