import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Italian contexts for CILS B1 Cittadinanza
const contexts = {
  ascolto: [
    'conversazione tra un cittadino e un impiegato comunale per richiedere un documento',
    'dialogo tra vicini di casa che discutono di questioni condominiali',
    'conversazione in una ASL per prenotare una visita medica',
    'discussione tra genitori e insegnanti durante un colloquio scolastico',
    'dialogo in una banca per aprire un conto corrente',
    'conversazione tra un cittadino e un funzionario per la richiesta di cittadinanza',
    'dialogo al mercato settimanale tra venditore e cliente',
    'conversazione tra un nuovo residente e il sindaco del comune'
  ],
  lettura: [
    'avviso del comune sui servizi per i cittadini',
    'regolamento condominiale e diritti dei residenti',
    'informazioni sui servizi sanitari locali',
    'comunicazione scolastica ai genitori',
    'guida ai servizi bancari per nuovi residenti',
    'procedura per la richiesta di cittadinanza italiana',
    'informazioni sui trasporti pubblici locali',
    'comunicazione sui diritti e doveri dei cittadini'
  ],
  scrittura: [
    'email formale al comune per richiedere informazioni su servizi',
    'lettera di reclamo per un servizio pubblico non funzionante',
    'richiesta scritta per ottenere un permesso dal comune',
    'email per prenotare un appuntamento presso uffici pubblici',
    'lettera formale per segnalare un problema nel quartiere',
    'richiesta di informazioni sui corsi di italiano per stranieri',
    'email per candidarsi a un lavoro nel settore pubblico',
    'lettera per richiedere chiarimenti su pratiche burocratiche'
  ],
  produzione_orale: [
    'presentazione della propria esperienza di integrazione in Italia',
    'descrizione del proprio percorso per ottenere la cittadinanza',
    'racconto della vita quotidiana nel proprio quartiere',
    'spiegazione dei propri diritti e doveri come cittadino',
    'descrizione dei servizi pubblici che si utilizzano regolarmente',
    'racconto delle difficoltà incontrate e come sono state superate',
    'presentazione del proprio lavoro e della propria famiglia',
    'descrizione delle tradizioni italiane che si sono imparate'
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { skill_type, count = 1, difficulty = 'B1' } = await req.json();

    if (!skill_type || !contexts[skill_type as keyof typeof contexts]) {
      throw new Error('Skill type non valido');
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurato');
    }

    const exercisesPromises = [];
    const skillContexts = contexts[skill_type as keyof typeof contexts];

    for (let i = 0; i < count; i++) {
      const randomContext = skillContexts[Math.floor(Math.random() * skillContexts.length)];
      exercisesPromises.push(generateExerciseWithGemini(skill_type, randomContext, difficulty));
    }

    const exercises = await Promise.all(exercisesPromises);
    const validExercises = exercises.filter(ex => ex !== null);

    if (validExercises.length === 0) {
      throw new Error('Impossibile generare esercizi');
    }

    // Generate audio for listening exercises
    if (skill_type === 'ascolto') {
      for (const exercise of validExercises) {
        if (exercise.audio_text) {
          try {
            const audioResponse = await fetch(`${req.url.replace('/generate-dynamic-exercises', '/generate-tts')}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                text: exercise.audio_text,
                voice: 'alice'
              })
            });

            if (audioResponse.ok) {
              const audioData = await audioResponse.json();
              exercise.audio_url = `data:audio/mp3;base64,${audioData.audioContent}`;
            }
          } catch (error) {
            console.log('Errore generazione audio:', error);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ exercises: validExercises }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Errore generazione dinamica:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateExerciseWithGemini(skillType: string, context: string, difficulty: string) {
  try {
    const prompt = createPromptForSkill(skillType, context, difficulty);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Nessun contenuto generato da Gemini');
    }

    return parseGeminiResponse(generatedText, skillType);
  } catch (error) {
    console.error('Errore Gemini:', error);
    return null;
  }
}

function createPromptForSkill(skillType: string, context: string, difficulty: string): string {
  const basePrompt = `Genera un esercizio per l'esame CILS B1 Cittadinanza in italiano.
  
Contesto: ${context}
Livello: ${difficulty}
Competenza: ${skillType}

L'esercizio deve essere realistico e utile per chi vuole ottenere la cittadinanza italiana.`;

  switch (skillType) {
    case 'ascolto':
      return `${basePrompt}

Crea un dialogo in italiano (massimo 80 parole) seguito da 4 domande a scelta multipla.

Formato JSON richiesto:
{
  "id": "ascolto_generated_[timestamp]",
  "type": "ascolto",
  "title": "[titolo dell'esercizio]",
  "prompt_it": "Ascolta il dialogo e rispondi alle domande.",
  "audio_text": "[testo del dialogo]",
  "timer_seconds": 480,
  "questions": [
    {
      "id": "q1",
      "text": "[domanda]",
      "options": ["A) [opzione]", "B) [opzione]", "C) [opzione]", "D) [opzione]"]
    }
  ]
}`;

    case 'lettura':
      return `${basePrompt}

Crea un testo in italiano (100-120 parole) seguito da 4 domande a scelta multipla.

Formato JSON richiesto:
{
  "id": "lettura_generated_[timestamp]",
  "type": "lettura", 
  "title": "[titolo dell'esercizio]",
  "prompt_it": "Leggi il testo e rispondi alle domande.",
  "text_it": "[testo da leggere]",
  "timer_seconds": 600,
  "questions": [
    {
      "id": "q1",
      "text": "[domanda]",
      "options": ["A) [opzione]", "B) [opzione]", "C) [opzione]", "D) [opzione]"]
    }
  ]
}`;

    case 'scrittura':
      return `${basePrompt}

Crea una consegna per scrivere un testo formale (90-120 parole).

Formato JSON richiesto:
{
  "id": "scrittura_generated_[timestamp]",
  "type": "scrittura",
  "title": "[titolo dell'esercizio]", 
  "prompt_it": "[consegna dettagliata per la scrittura]",
  "timer_seconds": 1800,
  "questions": [],
  "min_words": 90,
  "max_words": 120
}`;

    case 'produzione_orale':
      return `${basePrompt}

Crea una consegna per un monologo di 2-3 minuti.

Formato JSON richiesto:
{
  "id": "orale_generated_[timestamp]",
  "type": "produzione_orale",
  "title": "[titolo dell'esercizio]",
  "prompt_it": "[consegna per il monologo con punti da trattare]",
  "timer_seconds": 300,
  "questions": []
}`;

    default:
      throw new Error('Tipo di skill non supportato');
  }
}

function parseGeminiResponse(response: string, skillType: string) {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Nessun JSON trovato nella risposta');
    }

    const exercise = JSON.parse(jsonMatch[0]);
    
    // Add timestamp to ID
    if (exercise.id) {
      exercise.id = exercise.id.replace('[timestamp]', Date.now().toString());
    }

    // Validate required fields
    if (!exercise.id || !exercise.type || !exercise.title || !exercise.prompt_it) {
      throw new Error('Campi obbligatori mancanti');
    }

    return exercise;
  } catch (error) {
    console.error('Errore parsing Gemini response:', error);
    return null;
  }
}