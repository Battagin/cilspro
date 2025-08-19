import { createClient } from "@supabase/supabase-js";

const MODEL = process.env.GEMINI_MODEL_TEXT || "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

function supaSrv() {
  const url = "https://fbydiennwirsoccbngvt.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function callGeminiJSON(prompt: string, retries = 2) {
  let lastErr: any = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      });
      
      if (!r.ok) {
        throw new Error(`Gemini API error: ${r.status} ${r.statusText}`);
      }
      
      const j = await r.json();
      
      if (j.error) {
        throw new Error(`Gemini error: ${j.error.message}`);
      }
      
      const raw = j?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error("Empty Gemini response");
      
      // Robust JSON parsing
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error(`Invalid JSON from Gemini: ${raw.substring(0, 100)}...`);
        }
      }
      
      return parsed;
    } catch (e: any) {
      lastErr = e;
      console.log(`Gemini attempt ${i + 1} failed:`, e.message);
    }
  }
  throw lastErr || new Error("Gemini failed after retries");
}

function makeLetturaPrompt() {
  return `Genera un esercizio di LETTURA (livello B1 cittadinanza) in italiano con:
- title,
- prompt_it (consegna),
- text_it (120–180 parole) relativo a servizi pubblici (comune, sanità, trasporti o scuola),
- 3 domande a scelta multipla (A–D) con UNA sola risposta corretta.

RESTITUISCI SOLO JSON valido:
{
 "title":"...",
 "prompt_it":"...",
 "text_it":"...",
 "timer_seconds":600,
 "level":"B1",
 "mcq":[
   {"id":"q1","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"B"},
   {"id":"q2","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"C"},
   {"id":"q3","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A"}
 ]
}`;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }
    
    if (!GEMINI_KEY) {
      return res.status(503).json({ error: "Configura GEMINI_API_KEY nelle impostazioni." });
    }
    
    const supa = supaSrv();

    // Check if exercises already exist
    const { data: existing } = await supa.from("demo_exercises").select("id").limit(1);
    if (existing && existing.length > 0) {
      return res.status(200).json({ created: false, message: "Esistono già esercizi demo." });
    }

    console.log("Starting bootstrap process...");

    // LETTURA via Gemini with retries
    let lett;
    try {
      lett = await callGeminiJSON(makeLetturaPrompt(), 3);
    } catch (e: any) {
      console.error("Gemini failed:", e.message);
      return res.status(500).json({ error: `Gemini fallito: ${e.message}` });
    }

    // Validate Gemini response
    if (!lett.title || !lett.prompt_it || !lett.text_it || !lett.mcq || lett.mcq.length !== 3) {
      return res.status(500).json({ error: "Risposta Gemini incompleta" });
    }

    // Insert Lettura exercise
    const { data: lettData, error: lettError } = await supa.from("demo_exercises").insert({
      title: lett.title,
      skill_type: "lettura",
      content: {
        prompt_it: lett.prompt_it,
        text_it: lett.text_it,
        timer_seconds: lett.timer_seconds || 600,
        level: "B1"
      }
    }).select("id").single();

    if (lettError) {
      console.error("Insert lettura failed:", lettError);
      throw new Error(`Insert lettura failed: ${lettError.message}`);
    }

    const lettId = lettData.id;

    // Save questions
    const lettQuestions = lett.mcq.map((m: any) => ({
      id: m.id,
      text: m.question,
      options: [`A) ${m.options.A}`, `B) ${m.options.B}`, `C) ${m.options.C}`, `D) ${m.options.D}`]
    }));

    await supa.from("demo_questions").upsert({ exercise_id: lettId, questions: lettQuestions });

    // Save answer key (if table exists)
    const keyL = { items: lett.mcq.map((m: any) => ({ id: m.id, correct: m.correct })) };
    try {
      await supa.from("demo_exercise_keys").upsert({ exercise_id: lettId, answer_key: keyL });
    } catch (keyError) {
      console.log("demo_exercise_keys table not found, skipping answer key save");
    }

    // ASCOLTO (optional)
    let ascoltoId = null;
    const audioUrl = process.env.DEMO_ASCOLTO_AUDIO_URL;
    if (audioUrl) {
      const { data: ascoltoData, error: ascoltoError } = await supa.from("demo_exercises").insert({
        title: "Ascolto demo — Informazioni al Comune",
        skill_type: "ascolto",
        content: {
          prompt_it: "Ascolta l'audio e rispondi alle domande.",
          audio_url: audioUrl,
          timer_seconds: 480,
          level: "B1"
        }
      }).select("id").single();

      if (!ascoltoError) {
        ascoltoId = ascoltoData.id;
        await supa.from("demo_questions").upsert({ exercise_id: ascoltoId, questions: lettQuestions });
        try {
          await supa.from("demo_exercise_keys").upsert({ exercise_id: ascoltoId, answer_key: keyL });
        } catch (keyError) {
          console.log("demo_exercise_keys table not found for ascolto, skipping");
        }
      }
    }

    // SCRITTURA
    await supa.from("demo_exercises").insert({
      title: "Email di richiesta informazioni (residenza)",
      skill_type: "scrittura", 
      content: {
        prompt_it: "Scrivi una e-mail (90–120 parole) per chiedere quali documenti servono per richiedere la residenza a Vicenza.",
        timer_seconds: 1200,
        level: "B1",
        min_words: 90,
        max_words: 120
      }
    });

    // ORALE
    await supa.from("demo_exercises").insert({
      title: "Presentazione personale",
      skill_type: "orale",
      content: {
        prompt_it: "Registra un audio di 2 minuti: presentati, descrivi il tuo lavoro/studio e una difficoltà che hai superato vivendo in Italia.",
        timer_seconds: 600,
        level: "B1"
      }
    });

    console.log("Bootstrap completed successfully");
    return res.status(200).json({ 
      created: true, 
      ids: { lettura: lettId, ascolto: ascoltoId },
      message: "Esercizi demo creati con successo"
    });

  } catch (e: any) {
    console.error("Bootstrap error:", e);
    return res.status(500).json({ error: e.message || "Bootstrap demo fallito." });
  }
}