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

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada')
    }

    // Use Google Cloud Text-to-Speech via Gemini
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'it-IT',
          name: voice === 'alice' ? 'it-IT-Wavenet-A' : 'it-IT-Wavenet-B',
          ssmlGender: voice === 'alice' ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          sampleRateHertz: 24000
        }
      })
    })

    if (!response.ok) {
      // Fallback para mock de áudio se API não estiver disponível
      const mockAudioBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA="
      return new Response(
        JSON.stringify({ audioContent: mockAudioBase64 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ audioContent: data.audioContent }),
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