import { createClient } from "@supabase/supabase-js";

function supaSrv() {
  const url = "https://fbydiennwirsoccbngvt.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const supa = supaSrv();

    // Check if demo exercises already exist
    const { data: existing } = await supa
      .from("demo_exercises")
      .select("id")
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(200).json({ message: "Esercizi demo già esistenti", created: false });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY non configurato");
    }

    // Generate Lettura exercise with questions
    const letturaPrompt = `Genera un esercizio di comprensione scritta per l'esame CILS B1 Cittadinanza in italiano.

Restituisci JSON nel formato:
{
  "text": "Il testo da leggere (circa 300-400 parole) su un tema di cittadinanza italiana",
  "mcq": [
    {
      "id": "q1",
      "question": "Domanda di comprensione",
      "options": {
        "A": "Prima opzione",
        "B": "Seconda opzione", 
        "C": "Terza opzione",
        "D": "Quarta opzione"
      },
      "correct": "A"
    }
  ]
}

Crea 5 domande multiple choice con 4 opzioni ciascuna. Il testo deve riguardare temi di cittadinanza italiana (costituzione, diritti, doveri civici, istituzioni).`;

    const lettResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: letturaPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });

    if (!lettResponse.ok) {
      throw new Error(`Gemini API error: ${lettResponse.status}`);
    }

    const lettData = await lettResponse.json();
    const lettText = lettData.candidates[0].content.parts[0].text;
    const cleanLettText = lettText.replace(/```json\n?|\n?```/g, '').trim();
    const lett = JSON.parse(cleanLettText);

    // Insert Lettura exercise
    const { data: insL, error: errL } = await supa
      .from("demo_exercises")
      .insert({
        skill_type: "lettura",
        title: "Comprensione Scritta - Cittadinanza Italiana",
        content: {
          prompt_it: "Leggi il seguente testo e rispondi alle domande.",
          text_it: lett.text,
          timer_seconds: 600,
          level: "B1"
        }
      })
      .select("id")
      .single();

    if (errL) throw errL;

    // Save answer key for Lettura
    const lettAnswerKey = lett.mcq.reduce((acc: any, q: any) => {
      acc[q.id] = q.correct;
      return acc;
    }, {});

    await supa.from("demo_exercise_keys").insert({
      exercise_id: insL.id,
      answer_key: lettAnswerKey
    });

    // Save questions for Lettura (without answers)
    const lettQuestions = lett.mcq.map((m: any) => ({
      id: m.id,
      text: m.question,
      options: [
        `A) ${m.options.A}`,
        `B) ${m.options.B}`,
        `C) ${m.options.C}`,
        `D) ${m.options.D}`
      ]
    }));

    await supa.from("demo_questions").upsert({ 
      exercise_id: insL.id, 
      questions: lettQuestions 
    });

    // Create Ascolto exercise if audio URL is provided
    const DEMO_ASCOLTO_AUDIO_URL = process.env.DEMO_ASCOLTO_AUDIO_URL;
    let ascoltoId = null;
    
    if (DEMO_ASCOLTO_AUDIO_URL) {
      const { data: insA, error: errA } = await supa
        .from("demo_exercises")
        .insert({
          skill_type: "ascolto",
          title: "Comprensione Orale - Cittadinanza Italiana",
          content: {
            prompt_it: "Ascolta l'audio e rispondi alle domande.",
            audio_url: DEMO_ASCOLTO_AUDIO_URL,
            timer_seconds: 480,
            level: "B1"
          }
        })
        .select("id")
        .single();

      if (!errA) {
        ascoltoId = insA.id;
        
        // Reuse same answer key and questions for Ascolto
        await supa.from("demo_exercise_keys").insert({
          exercise_id: ascoltoId,
          answer_key: lettAnswerKey
        });

        await supa.from("demo_questions").upsert({ 
          exercise_id: ascoltoId, 
          questions: lettQuestions 
        });
      }
    }

    // Create Scrittura exercise
    const { data: insS, error: errS } = await supa
      .from("demo_exercises")
      .insert({
        skill_type: "scrittura",
        title: "Produzione Scritta - Cittadinanza Italiana",
        content: {
          prompt_it: "Scrivi un testo di almeno 150 parole sui diritti e doveri del cittadino italiano, basandoti sulla Costituzione italiana.",
          timer_seconds: 1200,
          level: "B1",
          min_words: 150,
          max_words: 250
        }
      })
      .select("id")
      .single();

    if (errS) throw errS;

    // Create Produzione Orale exercise
    const { data: insO, error: errO } = await supa
      .from("demo_exercises")
      .insert({
        skill_type: "produzione_orale",
        title: "Produzione Orale - Cittadinanza Italiana",
        content: {
          prompt_it: "Parla per almeno 2 minuti del ruolo delle istituzioni italiane nella vita democratica del paese.",
          timer_seconds: 600,
          level: "B1"
        }
      })
      .select("id")
      .single();

    if (errO) throw errO;

    return res.status(200).json({ 
      message: "Esercizi demo creati con successo", 
      created: true,
      exercises: {
        lettura: insL.id,
        ascolto: ascoltoId,
        scrittura: insS.id,
        produzione_orale: insO.id
      }
    });

  } catch (error) {
    console.error('Bootstrap error:', error);
    return res.status(500).json({ error: "Errore durante la creazione degli esercizi demo" });
  }
}