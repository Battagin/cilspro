import { createClient } from "@supabase/supabase-js";

// Use anon client for public access
function supaAnon() {
  const url = "https://fbydiennwirsoccbngvt.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZieWRpZW5ud2lyc29jY2JuZ3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTI0MTQsImV4cCI6MjA3MTA4ODQxNH0.d3WJbHq0IpTUDmtxqCvPiIctD8MVKzDSHvWTX2KwY7M";
  return createClient(url, key, { auth: { persistSession: false } });
}

// Fallback mock exercises in Italian
const getMockExercises = () => [
  {
    id: "mock_ascolto",
    type: "ascolto", 
    title: "Informazioni al Comune",
    prompt_it: "Ascolta l'audio e rispondi alle domande.",
    audio_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // placeholder
    text_it: null,
    timer_seconds: 480,
    level: "B1",
    questions: [
      { id: "q1", text: "Quando riapre l'ufficio?", options: ["A) 9:00", "B) 11:00", "C) 14:00", "D) 16:00"] },
      { id: "q2", text: "Per urgenze bisogna:", options: ["A) Telefonare", "B) Scrivere una e-mail", "C) Andare di persona", "D) Compilare un modulo"] }
    ]
  },
  {
    id: "mock_lettura",
    type: "lettura",
    title: "Avviso dell'Ufficio Anagrafe", 
    prompt_it: "Leggi il testo e rispondi alle domande.",
    audio_url: null,
    text_it: "AVVISO: L'ufficio anagrafe sarà chiuso lunedì mattina per aggiornamento dei sistemi. Riapertura alle 14:00. Per urgenze scrivere a anagrafe@comune.example.it oppure telefonare al numero verde.",
    timer_seconds: 600,
    level: "B1",
    questions: [
      { id: "q1", text: "Quando riapre l'ufficio?", options: ["A) 9:00", "B) 11:00", "C) 14:00", "D) 16:00"] },
      { id: "q2", text: "Per urgenze si deve:", options: ["A) Telefonare", "B) Scrivere una e-mail", "C) Presentarsi", "D) Compilare modulo"] }
    ]
  },
  {
    id: "mock_scrittura",
    type: "scrittura",
    title: "Email di richiesta informazioni", 
    prompt_it: "Scrivi una e-mail (90–120 parole) per chiedere quali documenti servono per richiedere la residenza a Vicenza.",
    audio_url: null,
    text_it: null,
    timer_seconds: 1200,
    level: "B1",
    questions: []
  },
  {
    id: "mock_orale",
    type: "produzione_orale",
    title: "Presentazione personale",
    prompt_it: "Registra un audio di 2 minuti: presentati, descrivi il tuo lavoro/studio e una difficoltà che hai superato vivendo in Italia.",
    audio_url: null,
    text_it: null,
    timer_seconds: 600,
    level: "B1", 
    questions: []
  }
];

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const supa = supaAnon();
    const skillOrder = ["ascolto", "lettura", "scrittura", "produzione_orale"];
    const finalItems: any[] = [];

    try {
      // Try to fetch real exercises from database
      let { data, error } = await supa
        .from("demo_exercises_public")
        .select("id, title, prompt_it, audio_url, text_it, timer_seconds, level, type")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        // Get questions for exercises
        const ids = data.map(d => d.id);
        const { data: questionsData } = await supa
          .from("demo_questions")
          .select("exercise_id, questions")
          .in("exercise_id", ids);
          
        const questionMap: Record<string, any[]> = {};
        for (const row of (questionsData || [])) {
          questionMap[row.exercise_id] = row.questions || [];
        }

        // Group exercises by type
        const exercisesByType: Record<string, any[]> = {};
        for (const exercise of data) {
          const mappedType = exercise.type === "orale" ? "produzione_orale" : exercise.type;
          if (!exercisesByType[mappedType]) {
            exercisesByType[mappedType] = [];
          }
          exercisesByType[mappedType].push({
            id: exercise.id,
            type: mappedType,
            title: exercise.title,
            prompt_it: exercise.prompt_it || "",
            audio_url: exercise.audio_url || null,
            text_it: exercise.text_it || null,
            timer_seconds: exercise.timer_seconds || 600,
            level: exercise.level || "B1",
            questions: questionMap[exercise.id] || []
          });
        }

        // Pick one random exercise per skill type
        for (const skillType of skillOrder) {
          const available = exercisesByType[skillType] || [];
          if (available.length > 0) {
            const randomIndex = Math.floor(Math.random() * available.length);
            finalItems.push(available[randomIndex]);
          }
        }
      }
    } catch (dbError) {
      console.error("Database access failed:", dbError);
      // Continue to fallback
    }

    // Fill missing skills with mocks
    const mocks = getMockExercises();
    for (const skillType of skillOrder) {
      const hasSkill = finalItems.some(item => item.type === skillType);
      if (!hasSkill) {
        const mock = mocks.find(m => m.type === skillType);
        if (mock) {
          finalItems.push(mock);
        }
      }
    }

    // If we still don't have 4 items, use all mocks
    if (finalItems.length < 4) {
      return res.status(200).json({ items: mocks });
    }

    return res.status(200).json({ items: finalItems });
  } catch (e: any) {
    console.error("Server error:", e);
    // Final fallback - return mocks
    return res.status(200).json({ items: getMockExercises() });
  }
}