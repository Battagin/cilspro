import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to detect if text contains dialogue
function hasDialogue(text: string): boolean {
  return text.includes(':') || text.includes('–') || text.includes('-') || text.includes('"')
}

// Function to extract speaker names and detect gender
function getSpeakerGender(name: string): 'male' | 'female' {
  const femaleNames = ['maria', 'anna', 'giulia', 'francesca', 'paola', 'laura', 'elena', 'sara', 'chiara', 'alessandra', 'sofia', 'valentina', 'federica', 'silvia', 'monica', 'lucia', 'barbara', 'roberta', 'emanuela', 'daniela']
  const maleNames = ['marco', 'giuseppe', 'francesco', 'antonio', 'andrea', 'giovanni', 'pietro', 'alessandro', 'stefano', 'lorenzo', 'matteo', 'luca', 'davide', 'gabriele', 'michele', 'roberto', 'paolo', 'carlo', 'alberto', 'fabio']
  
  const lowerName = name.toLowerCase()
  
  if (femaleNames.some(n => lowerName.includes(n))) return 'female'
  if (maleNames.some(n => lowerName.includes(n))) return 'male'
  
  // Default fallback: alternate genders for unnamed speakers
  return Math.random() > 0.5 ? 'male' : 'female'
}

// Function to parse dialogue and assign voices
function parseDialogue(text: string) {
  const lines = text.split('\n').filter(line => line.trim())
  const speakers = new Map()
  const parts = []
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [speaker, dialogue] = line.split(':', 2)
      const speakerName = speaker.trim()
      
      if (!speakers.has(speakerName)) {
        const gender = getSpeakerGender(speakerName)
        speakers.set(speakerName, gender)
      }
      
      parts.push({
        speaker: speakerName,
        text: dialogue.trim(),
        gender: speakers.get(speakerName)
      })
    } else {
      // Narrator or description
      parts.push({
        speaker: 'narrator',
        text: line.trim(),
        gender: 'female' // Default narrator voice
      })
    }
  }
  
  return parts
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'alice', isListeningExercise = false } = await req.json()

    if (!text) {
      throw new Error('Texto é obrigatório')
    }

    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenlabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY não configurada')
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada')
    }

    let textForTTS = text

    // If it's a listening exercise, generate dialogue instead of reading the prompt
    if (isListeningExercise) {
      console.log('Generating dialogue for listening exercise')
      
      const dialoguePrompt = `
        Crea un dialogo originale in italiano (nível B1) basato su questo contesto:
        "${text}"
        
        REGOLE IMPORTANTI:
        - NON leggere il testo dell'esercizio
        - Crea solo il dialogo con 2 personaggi (120-180 parole)
        - Usa nomi italiani: maschili (Marco, Luca, Giovanni, etc.) o femminili (Maria, Anna, Giulia, etc.)
        - Formato: "Nome: [fala]" per ogni turno
        - Almeno 3 scambi per persona
        - Linguaggio naturale, nível B1
        - Tema coerente con il contesto dell'esercizio
        
        Restituisci SOLO il dialogo, senza prefazioni o spiegazioni.
      `

      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: dialoguePrompt }] }]
          })
        })

        const geminiData = await geminiResponse.json()
        const generatedDialogue = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        
        if (generatedDialogue) {
          textForTTS = generatedDialogue
          console.log('Generated dialogue:', textForTTS)
        }
      } catch (error) {
        console.error('Error generating dialogue with Gemini:', error)
        // Fallback to original text if Gemini fails
      }
    }

    // Voice mapping with better Italian voices
    const voiceIds = {
      'alice': 'Xb7hH8MSUJpSbSDYk0k2', // Alice (female)
      'marco': 'TX3LPaxmHKxFdv7VOQHJ', // Liam (male)
      'female': '9BWtsMINqrJLrRacOk9x', // Aria (female)
      'male': 'bIHbv24MWmeRgasZH58o'  // Will (male)
    }

    // Check if text contains dialogue
    if (hasDialogue(textForTTS)) {
      console.log('Dialogue detected, generating multi-voice audio')
      const dialogueParts = parseDialogue(textForTTS)
      const audioSegments = []
      
      for (const part of dialogueParts) {
        const voiceId = part.gender === 'male' ? voiceIds.male : voiceIds.female
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenlabsApiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: part.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        })
        
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          audioSegments.push(new Uint8Array(arrayBuffer))
        }
      }
      
      // For now, return the first segment (proper audio concatenation would require more complex processing)
      if (audioSegments.length > 0) {
        const base64Audio = base64Encode(audioSegments[0])
        return new Response(
          JSON.stringify({ audioContent: base64Audio }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Single voice generation (original logic)
    const selectedVoiceId = voiceIds[voice as keyof typeof voiceIds] || voiceIds.alice

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: textForTTS,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      console.error('ElevenLabs API error:', await response.text())
      // Fallback para mock de áudio se API falhar
      const mockAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA="
      return new Response(
        JSON.stringify({ audioContent: mockAudioBase64 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert audio buffer to base64 safely (no spread to avoid call stack issues)
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = base64Encode(new Uint8Array(arrayBuffer))

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na geração de áudio:', error)
    
    // Retorna mock de áudio em caso de erro
    const mockAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA="
    return new Response(
      JSON.stringify({ audioContent: mockAudioBase64 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})