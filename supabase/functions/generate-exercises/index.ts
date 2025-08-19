import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Exercícios predefinidos usando Gemini
const predefinedExercises = {
  ascolto: {
    id: "ascolto_1",
    type: "ascolto",
    title: "Conversazione al Bar",
    prompt_it: "Ascolta il dialogo e rispondi alle domande.",
    audio_text: "Marco: Buongiorno, vorrei un cappuccino e un cornetto. Barista: Subito! Desidera altro? Marco: No grazie, quanto costa? Barista: Sono 3 euro e 50. Marco: Ecco a lei. Barista: Grazie, arrivederci!",
    timer_seconds: 300,
    questions: [
      {
        id: "q1",
        text: "Cosa ordina Marco?",
        options: ["A) Espresso e brioche", "B) Cappuccino e cornetto", "C) Caffè macchiato", "D) Tè e biscotti"]
      },
      {
        id: "q2", 
        text: "Quanto paga Marco?",
        options: ["A) 2 euro e 50", "B) 3 euro", "C) 3 euro e 50", "D) 4 euro"]
      },
      {
        id: "q3",
        text: "Dove si svolge il dialogo?",
        options: ["A) In un ristorante", "B) Al bar", "C) In una pasticceria", "D) A casa"]
      },
      {
        id: "q4",
        text: "Come saluta il barista alla fine?",
        options: ["A) Buongiorno", "B) Ciao", "C) Arrivederci", "D) A presto"]
      }
    ]
  },
  lettura: {
    id: "lettura_1", 
    type: "lettura",
    title: "Orari dei Negozi",
    prompt_it: "Leggi il testo e rispondi alle domande.",
    text_it: "ORARI NEGOZI CENTRO COMMERCIALE\n\nTutti i negozi sono aperti dal lunedì al sabato dalle 9:00 alle 20:00.\nLa domenica apertura dalle 10:00 alle 19:00.\nIl supermercato è aperto tutti i giorni dalle 8:00 alle 21:00.\nLa farmacia chiude alle 19:30 dal lunedì al venerdì.\nNel weekend la farmacia è aperta solo la domenica mattina dalle 9:00 alle 13:00.",
    timer_seconds: 600,
    questions: [
      {
        id: "q1",
        text: "A che ora aprono i negozi la domenica?",
        options: ["A) Alle 8:00", "B) Alle 9:00", "C) Alle 10:00", "D) Alle 11:00"]
      },
      {
        id: "q2",
        text: "Quando chiude il supermercato?",
        options: ["A) Alle 19:00", "B) Alle 20:00", "C) Alle 21:00", "D) Alle 22:00"]
      },
      {
        id: "q3", 
        text: "La farmacia è aperta il sabato?",
        options: ["A) Sì, tutto il giorno", "B) Sì, solo la mattina", "C) No", "D) Solo il pomeriggio"]
      },
      {
        id: "q4",
        text: "Fino a che ora resta aperta la farmacia in settimana?",
        options: ["A) Alle 19:00", "B) Alle 19:30", "C) Alle 20:00", "D) Alle 21:00"]
      }
    ]
  },
  scrittura: {
    id: "scrittura_1",
    type: "scrittura", 
    title: "Email Formale",
    prompt_it: "Scrivi un'email formale di almeno 80 parole per prenotare una visita medica. Includi: motivo della visita, giorni disponibili, i tuoi dati.",
    timer_seconds: 1800,
    questions: []
  },
  produzione_orale: {
    id: "orale_1",
    type: "produzione_orale",
    title: "Presentazione Personale", 
    prompt_it: "Presentati in italiano parlando per 2-3 minuti. Parla di: nome, età, città, lavoro/studi, hobby, famiglia.",
    timer_seconds: 300,
    questions: []
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { skill_type } = await req.json()

    if (!skill_type || !predefinedExercises[skill_type as keyof typeof predefinedExercises]) {
      throw new Error('Tipo di competenza non valido')
    }

    const exercise = predefinedExercises[skill_type as keyof typeof predefinedExercises]

    // Se è un esercizio di ascolto, genera l'audio
    if (skill_type === 'ascolto' && exercise.audio_text) {
      try {
        const audioResponse = await fetch(`${req.url.replace('/generate-exercises', '/generate-tts')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: exercise.audio_text,
            voice: 'alice'
          })
        })

        if (audioResponse.ok) {
          const audioData = await audioResponse.json()
          exercise.audio_url = `data:audio/mp3;base64,${audioData.audioContent}`
        }
      } catch (error) {
        console.log('Errore generazione audio, usando fallback:', error)
      }
    }

    return new Response(
      JSON.stringify({ exercise }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Errore nella generazione esercizio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})