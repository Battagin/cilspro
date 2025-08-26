import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { exercise, answers, writingText, transcription } = await req.json()

    if (!exercise) {
      throw new Error('Exercise data is required')
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY non configurata')
    }

    let feedback = ""
    let score = 0
    let corrections = {}

    if (exercise.type === 'ascolto' || exercise.type === 'lettura') {
      // For dynamic exercises, we need to evaluate based on actual questions
      if (exercise.content?.questions) {
        const questions = exercise.content.questions
        let correct = 0
        const total = questions.length
        const userCorrections = {}

        for (const question of questions) {
          const userAnswer = answers[question.id]
          const correctAnswer = question.options[0] // Assuming first option is correct for now
          
          if (userAnswer === correctAnswer) {
            correct++
          }
          
          userCorrections[question.id] = {
            correct: correctAnswer,
            user: userAnswer,
            isCorrect: userAnswer === correctAnswer
          }
        }

        corrections = userCorrections
        score = Math.round((correct / total) * 100)
        feedback = `Hai risposto correttamente a ${correct} domande su ${total}. ${
          score >= 70 ? 'Ottimo lavoro!' : score >= 50 ? 'Buono, ma puoi migliorare.' : 'Continua a studiare!'
        }`
      } else {
        // Fallback for older exercises without dynamic questions
        score = 60
        feedback = "Esercizio completato. Continua a praticare!"
      }
    } else if (exercise.type === 'scrittura') {
      // Evaluate writing with Gemini
      const prompt = `
        Valuta questo testo scritto per l'esame CILS B1 Cittadinanza:
        
        Consegna: ${exercise.content?.prompt_it || exercise.prompt_it}
        
        Testo dello studente:
        "${writingText}"
        
        Criteri di valutazione:
        1. Completezza del contenuto (0-25 punti)
        2. Correttezza grammaticale (0-25 punti)  
        3. Lessico appropriato (0-25 punti)
        4. Coerenza e coesione (0-25 punti)
        
        Fornisci un punteggio totale su 100 e un feedback breve (max 3 frasi) in italiano.
        Formato della risposta:
        PUNTEGGIO: [numero]
        FEEDBACK: [feedback dettagliato]
      `

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      const scoreMatch = aiResponse.match(/PUNTEGGIO:\s*(\d+)/)
      const feedbackMatch = aiResponse.match(/FEEDBACK:\s*(.*)/s)
      
      score = scoreMatch ? parseInt(scoreMatch[1]) : 60
      feedback = feedbackMatch ? feedbackMatch[1].trim() : "Valutazione completata."
      
    } else if (exercise.type === 'orale' || exercise.type === 'produzione_orale') {
      // Evaluate speaking with Gemini using transcription
      const { duration_seconds } = await req.json()
      const isShortResponse = duration_seconds && duration_seconds < 45
      
      const prompt = `
        Valuta questa produzione orale per l'esame CILS B1 Cittadinanza:
        
        Consegna: ${exercise.content?.prompt_it || exercise.prompt_it}
        
        Trascrizione dell'audio dello studente:
        "${transcription}"
        
        Durata registrazione: ${duration_seconds || 0} secondi
        
        REGOLE IMPORTANTI:
        - Valuta sempre, anche se la durata è breve
        - Se durata < 45 secondi, includi nel feedback: "Risposta breve: tempo inferiore al minimo consigliato"
        - Non bloccare mai la valutazione per durata insufficiente
        
        Criteri di valutazione:
        1. Completezza del contenuto (0-25 punti)
        2. Correttezza grammaticale (0-25 punti)
        3. Lessico appropriato (0-25 punti)
        4. Fluenza e pronuncia (0-25 punti)
        
        Fornisci un punteggio totale su 100 e un feedback breve (max 3 frasi) in italiano.
        Includi 2 suggerimenti concreti per migliorare.
        
        Formato della risposta:
        PUNTEGGIO: [numero]
        FEEDBACK: [feedback dettagliato]
        SUGGERIMENTI: [2 suggerimenti concreti]
      `

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      const scoreMatch = aiResponse.match(/PUNTEGGIO:\s*(\d+)/)
      const feedbackMatch = aiResponse.match(/FEEDBACK:\s*(.*?)(?=SUGGERIMENTI:|$)/s)
      const suggestionsMatch = aiResponse.match(/SUGGERIMENTI:\s*(.*)/s)
      
      score = scoreMatch ? parseInt(scoreMatch[1]) : 60
      let evaluationFeedback = feedbackMatch ? feedbackMatch[1].trim() : "Valutazione completata."
      
      // Add short response warning if applicable
      if (isShortResponse) {
        evaluationFeedback += " Risposta breve: tempo inferiore al minimo consigliato."
      }
      
      // Add suggestions to feedback
      if (suggestionsMatch) {
        evaluationFeedback += ` Suggerimenti: ${suggestionsMatch[1].trim()}`
      }
      
      feedback = evaluationFeedback
    }

    return new Response(
      JSON.stringify({ 
        score, 
        feedback, 
        corrections,
        duration_seconds: duration_seconds || 0,
        short_response: isShortResponse || false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Errore nella valutazione:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        score: 0,
        feedback: "Si è verificato un errore durante la valutazione. Riprova."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})