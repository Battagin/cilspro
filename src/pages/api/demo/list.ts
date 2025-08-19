import { createClient } from "@supabase/supabase-js";

function supaSrv() {
  const url = "https://fbydiennwirsoccbngvt.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const supa = supaSrv();

    // Check if exercises exist, if not bootstrap them
    const { data: existingCheck } = await supa
      .from("demo_exercises")
      .select("id")
      .limit(1);

    if (!existingCheck || existingCheck.length === 0) {
      // Bootstrap exercises
      const bootstrapResponse = await fetch(`${req.headers.origin || 'http://localhost:5173'}/api/demo/bootstrap`, {
        method: 'POST'
      });
      
      if (!bootstrapResponse.ok) {
        console.error("Bootstrap failed");
        return res.status(500).json({ error: "Impossibile inizializzare gli esercizi demo" });
      }
    }

    // Read from public view but via service role (server-side), and join questions
    const { data, error } = await supa
      .from("demo_exercises_public")
      .select("id, title, skill_type, content, created_at, updated_at")
      .order("id", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Impossibile caricare gli esercizi. Riprova." });
    }

    // Bring questions (if they exist)
    const ids = (data || []).map((d: any) => d.id);
    let qmap: Record<string, any[]> = {};
    if (ids.length) {
      const { data: qrows } = await supa
        .from("demo_questions")
        .select("exercise_id, questions")
        .in("exercise_id", ids);
      for (const r of (qrows || [])) {
        qmap[r.exercise_id] = r.questions || [];
      }
    }

    // Map 'orale' -> 'produzione_orale' to match frontend expectations
    const normalized = (data || []).map((r: any) => {
      const content = r.content || {};
      return {
        id: r.id,
        type: r.skill_type === "orale" ? "produzione_orale" : r.skill_type,
        title: r.title,
        prompt_it: content.prompt_it || "",
        audio_url: content.audio_url || null,
        text_it: content.text_it || null,
        timer_seconds: content.timer_seconds || 600,
        level: content.level || "B1",
        questions: qmap[r.id] || [],
        min_words: content.min_words,
        max_words: content.max_words
      };
    });

    // Pick at most 1 per skill type
    const order = ["ascolto", "lettura", "scrittura", "produzione_orale"];
    const out: any[] = [];
    for (const t of order) {
      const found = normalized.find((x: any) => x.type === t);
      if (found) {
        out.push(found);
      }
    }

    return res.status(200).json({ items: out });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "Impossibile caricare gli esercizi. Riprova." });
  }
}