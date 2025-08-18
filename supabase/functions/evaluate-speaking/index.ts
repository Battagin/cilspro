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
    const { transcription } = await req.json();

    if (!transcription || transcription.trim().length === 0) {
      throw new Error('Trascrizione non fornita');
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
            content: `Sei un valutatore esperto per l'esame CILS B1 Cittadinanza - produzione orale. Valuta questa trascrizione secondo i criteri CILS per il livello B1:

1. ADEGUATEZZA (0-100): Rispetto della consegna, contenuto pertinente al tema
2. FLUIDITÀ (0-100): Scorrevolezza del discorso, pause naturali, ritmo
3. LESSICO (0-100): Varietà lessicale, appropriatezza, precisione
4. PRONUNCIA (0-100): Chiarezza articolatoria, accento, comprensibilità

Considera che stai valutando una trascrizione, quindi non puoi giudicare la vera pronuncia ma solo la correttezza lessicale e grammaticale.

Restituisci SOLO un JSON valido con questa struttura:
{
  "score": [punteggio medio 0-100],
  "criteria": {
    "adeguatezza": [0-100],
    "fluidita": [0-100],
    "lessico": [0-100], 
    "pronuncia": [0-100]
  },
  "feedback": "[feedback breve e motivante in 1-2 frasi]",
  "suggestions": ["[suggerimento 1]", "[suggerimento 2]", "[suggerimento 3]"]
}`
          },
          {
            role: 'user',
            content: `Valuta questa trascrizione di produzione orale:\n\n"${transcription}"`
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

    console.log('Speaking evaluation:', evaluation);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in evaluate-speaking:', error);
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