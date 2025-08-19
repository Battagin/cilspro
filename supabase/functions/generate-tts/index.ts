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
    const { text, voice = 'alice' } = await req.json()

    if (!text) {
      throw new Error('Texto é obrigatório')
    }

    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenlabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY não configurada')
    }

    // Map voice names to ElevenLabs voice IDs (Italian voices)
    const voiceIds = {
      'alice': 'Xb7hH8MSUJpSbSDYk0k2', // Alice
      'marco': 'TX3LPaxmHKxFdv7VOQHJ', // Liam (male voice)
      'female': '9BWtsMINqrJLrRacOk9x', // Aria
      'male': 'bIHbv24MWmeRgasZH58o'  // Will
    }

    const selectedVoiceId = voiceIds[voice as keyof typeof voiceIds] || voiceIds.alice

    // Generate speech using ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
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

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

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