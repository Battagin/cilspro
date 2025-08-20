import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Array de exercícios múltiplos para cada competência
const exerciseVariations = {
  ascolto: [
    {
      id: "ascolto_1",
      type: "ascolto",
      title: "Conversazione al Bar",
      prompt_it: "Ascolta il dialogo e rispondi alle domande.",
      audio_text: "Marco: Buongiorno, vorrei un cappuccino e un cornetto. Barista: Subito! Desidera altro? Marco: No grazie, quanto costa? Barista: Sono 3 euro e 50. Marco: Ecco a lei. Barista: Grazie, arrivederci!",
      timer_seconds: 480,
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
    {
      id: "ascolto_2",
      type: "ascolto", 
      title: "Al Supermercato",
      prompt_it: "Ascolta il dialogo e rispondi alle domande.",
      audio_text: "Cliente: Scusi, dove trovo il pane? Commesso: Al reparto panetteria, in fondo a destra. Cliente: E la frutta? Commesso: Appena entrati, sulla sinistra. Cliente: Grazie mille! Commesso: Prego, buona spesa!",
      timer_seconds: 480,
      questions: [
        {
          id: "q1",
          text: "Cosa cerca il cliente?",
          options: ["A) Solo pane", "B) Solo frutta", "C) Pane e frutta", "D) Verdura"]
        },
        {
          id: "q2",
          text: "Dove si trova il pane?",
          options: ["A) A sinistra", "B) Al centro", "C) In fondo a destra", "D) All'ingresso"]
        },
        {
          id: "q3",
          text: "Dove si trova la frutta?", 
          options: ["A) In fondo", "B) Sulla sinistra all'ingresso", "C) A destra", "D) Al piano superiore"]
        },
        {
          id: "q4",
          text: "Come saluta il commesso?",
          options: ["A) Arrivederci", "B) Buona spesa", "C) A presto", "D) Ciao"]
        }
      ]
    },
    {
      id: "ascolto_3",
      type: "ascolto",
      title: "Prenotazione Medica",
      prompt_it: "Ascolta il dialogo e rispondi alle domande.",
      audio_text: "Paziente: Buongiorno, vorrei prenotare una visita. Segretaria: Per che tipo di visita? Paziente: Dal cardiologo. Segretaria: Il primo appuntamento disponibile è venerdì 15 alle 10:30. Paziente: Va bene, grazie.",
      timer_seconds: 480,
      questions: [
        {
          id: "q1",
          text: "Che tipo di visita vuole prenotare?",
          options: ["A) Dentista", "B) Cardiologo", "C) Oculista", "D) Ortopedico"]
        },
        {
          id: "q2",
          text: "Quando è l'appuntamento?",
          options: ["A) Giovedì 14", "B) Venerdì 15", "C) Sabato 16", "D) Lunedì 18"]
        },
        {
          id: "q3",
          text: "A che ora è l'appuntamento?",
          options: ["A) 9:30", "B) 10:00", "C) 10:30", "D) 11:00"]
        },
        {
          id: "q4",
          text: "Il paziente accetta l'appuntamento?",
          options: ["A) No", "B) Sì", "C) Chiede di cambiare", "D) Non risponde"]
        }
      ]
    }
  ],
  lettura: [
    {
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
    {
      id: "lettura_2",
      type: "lettura",
      title: "Avviso Biblioteca",
      prompt_it: "Leggi il testo e rispondi alle domande.",
      text_it: "BIBLIOTECA COMUNALE - AVVISO\n\nDa lunedì 12 marzo la biblioteca sarà aperta con i seguenti orari:\nLunedì e mercoledì: 14:00-18:00\nMartedì, giovedì, venerdì: 9:00-13:00 e 14:00-18:00\nSabato: 9:00-12:00\nDomenica: CHIUSO\n\nPer il prestito libri è necessaria la tessera della biblioteca.\nLa tessera costa 5 euro all'anno.",
      timer_seconds: 600,
      questions: [
        {
          id: "q1",
          text: "Quando è aperta la biblioteca il lunedì?",
          options: ["A) 9:00-13:00", "B) 14:00-18:00", "C) Tutto il giorno", "D) È chiusa"]
        },
        {
          id: "q2",
          text: "Il sabato la biblioteca chiude alle:",
          options: ["A) 12:00", "B) 13:00", "C) 18:00", "D) Non apre"]
        },
        {
          id: "q3",
          text: "Quanto costa la tessera?",
          options: ["A) È gratuita", "B) 3 euro", "C) 5 euro", "D) 10 euro"]
        },
        {
          id: "q4",
          text: "Quando è chiusa la biblioteca?",
          options: ["A) Mai", "B) Solo domenica", "C) Weekend", "D) Tutti i pomeriggi"]
        }
      ]
    },
    {
      id: "lettura_3",
      type: "lettura",
      title: "Corso di Italiano",
      prompt_it: "Leggi il testo e rispondi alle domande.",
      text_it: "CORSO DI ITALIANO PER STRANIERI\n\nInizio: 15 settembre\nDurata: 6 mesi (fino a marzo)\nOrario: martedì e giovedì 19:00-21:00\nCosto: 120 euro (pagamento in 3 rate)\nLivello: A2-B1\n\nIncluso nel corso:\n- Libro di testo\n- Materiale didattico\n- Certificato finale\n\nPer iscrizioni: chiamare il numero 041-5555678",
      timer_seconds: 600,
      questions: [
        {
          id: "q1",
          text: "Quando inizia il corso?",
          options: ["A) 1 settembre", "B) 15 settembre", "C) 15 ottobre", "D) 1 marzo"]
        },
        {
          id: "q2",
          text: "Quanto dura il corso?",
          options: ["A) 3 mesi", "B) 4 mesi", "C) 6 mesi", "D) 1 anno"]
        },
        {
          id: "q3",
          text: "Qual è il costo totale?",
          options: ["A) 100 euro", "B) 120 euro", "C) 150 euro", "D) 200 euro"]
        },
        {
          id: "q4",
          text: "Cosa è incluso nel prezzo?",
          options: ["A) Solo lezioni", "B) Libro e certificato", "C) Libro, materiale e certificato", "D) Solo il certificato"]
        }
      ]
    }
  ],
  scrittura: [
    {
      id: "scrittura_1",
      type: "scrittura", 
      title: "Email Formale",
      prompt_it: "Scrivi un'email formale di almeno 90 parole per prenotare una visita medica. Includi: motivo della visita, giorni disponibili, i tuoi dati.",
      timer_seconds: 1800,
      questions: []
    },
    {
      id: "scrittura_2",
      type: "scrittura",
      title: "Lettera di Reclamo",
      prompt_it: "Scrivi una lettera formale di almeno 90 parole per fare un reclamo su un prodotto difettoso che hai comprato. Spiega il problema e cosa chiedi.",
      timer_seconds: 1800,
      questions: []
    },
    {
      id: "scrittura_3",
      type: "scrittura",
      title: "Richiesta Informazioni",
      prompt_it: "Scrivi un'email di almeno 90 parole per chiedere informazioni su un corso di italiano. Chiedi costi, orari e come iscriversi.",
      timer_seconds: 1800,
      questions: []
    }
  ],
  produzione_orale: [
    {
      id: "orale_1",
      type: "produzione_orale",
      title: "Presentazione Personale", 
      prompt_it: "Presentati in italiano parlando per 2-3 minuti. Parla di: nome, età, città, lavoro/studi, hobby, famiglia.",
      timer_seconds: 300,
      questions: []
    },
    {
      id: "orale_2",
      type: "produzione_orale",
      title: "La Tua Città",
      prompt_it: "Descrivi la città dove vivi per 2-3 minuti. Parla di: dove si trova, com'è, cosa ti piace e cosa non ti piace.",
      timer_seconds: 300,
      questions: []
    },
    {
      id: "orale_3",
      type: "produzione_orale",
      title: "Esperienza in Italia",
      prompt_it: "Racconta la tua esperienza in Italia per 2-3 minuti. Parla di: quando sei arrivato, difficoltà incontrate, cose positive.",
      timer_seconds: 300,
      questions: []
    }
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { skill_type, count } = await req.json()

    if (!skill_type || !exerciseVariations[skill_type as keyof typeof exerciseVariations]) {
      throw new Error('Tipo di competenza non valido')
    }

    const availableExercises = exerciseVariations[skill_type as keyof typeof exerciseVariations]
    const requestedCount = count || 1
    
    // Seleziona casualmente gli esercizi richiesti
    const shuffled = [...availableExercises].sort(() => Math.random() - 0.5)
    const selectedExercises = shuffled.slice(0, Math.min(requestedCount, availableExercises.length))

    // Se è richiesto un solo esercizio, restituisci l'oggetto singolo
    if (requestedCount === 1) {
      const exercise = selectedExercises[0]
      
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
    } else {
      // Restituisci array di esercizi
      const exercises = []
      
      for (const exercise of selectedExercises) {
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
        
        exercises.push(exercise)
      }

      return new Response(
        JSON.stringify({ exercises }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Errore nella generazione esercizio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})