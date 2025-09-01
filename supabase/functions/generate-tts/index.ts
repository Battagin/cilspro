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

    const googleApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY')
    if (!googleApiKey) {
      throw new Error('GOOGLE_CLOUD_API_KEY não configurada')
    }

    const googleProjectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    if (!googleProjectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID não configurado')
    }

    let textForTTS = text

    // If it's a listening exercise, generate dialogue using Google Vertex AI (Gemini)
    if (isListeningExercise) {
      console.log('Generating dialogue for listening exercise with Vertex AI')
      
      const dialoguePrompt = `
        Crea un dialogo originale in italiano (livello B1) basato su questo contesto:
        "${text}"
        
        REGOLE IMPORTANTI:
        - NON leggere il testo dell'esercizio o frasi tecniche
        - Crea SOLO il dialogo naturale con 2 personaggi (150-200 parole)
        - Usa nomi italiani: maschili (Marco, Luca, Giovanni, Alessandro, Francesco) o femminili (Maria, Anna, Giulia, Sofia, Francesca)
        - Formato: "Nome: [battuta]" per ogni turno
        - MINIMO 4 scambi per persona (8 battute totali)
        - Linguaggio naturale e fluido, livello B1
        - Dialogo deve durare almeno 20-30 secondi quando letto
        - Tema coerente con il contesto dell'esercizio
        - Includi dettagli specifici e conversazione realistica
        
        Restituisci SOLO il dialogo, senza prefazioni, spiegazioni o note tecniche.
      `

      try {
        const vertexResponse = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/${googleProjectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${googleApiKey}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ text: dialoguePrompt }] 
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        })

        if (vertexResponse.ok) {
          const vertexData = await vertexResponse.json()
          const generatedDialogue = vertexData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          
          if (generatedDialogue) {
            textForTTS = generatedDialogue
            console.log('Generated dialogue with Vertex AI:', textForTTS)
          }
        } else {
          console.error('Vertex AI error:', await vertexResponse.text())
        }
      } catch (error) {
        console.error('Error generating dialogue with Vertex AI:', error)
        // Fallback to original text if Vertex AI fails
      }
    }

    // Voice mapping for Google Cloud Text-to-Speech (Italian voices)
    const voiceMapping = {
      'alice': { name: 'it-IT-Elsa', ssmlGender: 'FEMALE' },
      'marco': { name: 'it-IT-Cosimo', ssmlGender: 'MALE' },
      'female': { name: 'it-IT-Elsa', ssmlGender: 'FEMALE' },
      'male': { name: 'it-IT-Cosimo', ssmlGender: 'MALE' }
    }

    // Check if text contains dialogue
    if (hasDialogue(textForTTS)) {
      console.log('Dialogue detected, generating multi-voice audio with Google TTS')
      const dialogueParts = parseDialogue(textForTTS)
      const audioSegments = []
      
      for (const part of dialogueParts) {
        const selectedVoice = part.gender === 'male' ? voiceMapping.male : voiceMapping.female
        
        const ttsRequest = {
          input: { text: part.text },
          voice: {
            languageCode: 'it-IT',
            name: selectedVoice.name,
            ssmlGender: selectedVoice.ssmlGender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0
          }
        }

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ttsRequest)
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.audioContent) {
            // Decode base64 to binary
            const binaryAudio = atob(data.audioContent)
            const audioBytes = new Uint8Array(binaryAudio.length)
            for (let i = 0; i < binaryAudio.length; i++) {
              audioBytes[i] = binaryAudio.charCodeAt(i)
            }
            audioSegments.push(audioBytes)
          }
        } else {
          console.error('Google TTS error:', await response.text())
        }
      }
      
      // Combine all segments into a single MP3
      if (audioSegments.length > 0) {
        const totalLength = audioSegments.reduce((acc, seg) => acc + seg.length, 0)
        const combined = new Uint8Array(totalLength)
        let offset = 0
        for (const seg of audioSegments) {
          combined.set(seg, offset)
          offset += seg.length
        }
        const base64Audio = base64Encode(combined)
        return new Response(
          JSON.stringify({ audioContent: base64Audio, dialogueText: textForTTS }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Single voice generation using Google Cloud TTS
    const selectedVoice = voiceMapping[voice as keyof typeof voiceMapping] || voiceMapping.alice

    const ttsRequest = {
      input: { text: textForTTS },
      voice: {
        languageCode: 'it-IT',
        name: selectedVoice.name,
        ssmlGender: selectedVoice.ssmlGender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      }
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsRequest)
    })

    if (!response.ok) {
      console.error('Google TTS API error:', await response.text())
      // Fallback para mock de áudio se API falhar
      const mockAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA="
      return new Response(
        JSON.stringify({ audioContent: mockAudioBase64, dialogueText: textForTTS }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    if (!data.audioContent) {
      console.error('No audio content received from Google TTS')
      const mockAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA="
      return new Response(
        JSON.stringify({ audioContent: mockAudioBase64, dialogueText: textForTTS }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ audioContent: data.audioContent, dialogueText: textForTTS }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na geração de áudio:', error)
    
    // Retorna mock de áudio em caso de erro
    const mockAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA="
    return new Response(
      JSON.stringify({ audioContent: mockAudioBase64, dialogueText: 'Errore TTS: usando Google Cloud Text-to-Speech.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})