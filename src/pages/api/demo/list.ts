import { createClient } from "@supabase/supabase-js";

function createServiceClient() {
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

    const supa = createServiceClient();

    // Read from public view using service role
    const { data, error } = await supa
      .from("demo_exercises_public")
      .select("id, title, skill_type, content, created_at, updated_at")
      .order("id", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Impossibile caricare gli esercizi. Riprova." });
    }

    // Get questions for all exercises
    const ids = (data || []).map(d => d.id);
    let questionMap: Record<string, any[]> = {};
    
    if (ids.length > 0) {
      const { data: questionsData } = await supa
        .from("demo_questions")
        .select("exercise_id, questions")
        .in("exercise_id", ids);
        
      for (const row of (questionsData || [])) {
        questionMap[row.exercise_id] = row.questions || [];
      }
    }

    // Transform data for frontend and fix skill type mapping
    const items = (data || []).map((exercise: any) => {
      const content = exercise.content || {};
      // Map skill types to match frontend expectations
      const mappedType = exercise.skill_type === "orale" ? "produzione_orale" : exercise.skill_type;
      
      return {
        id: exercise.id,
        type: mappedType,
        title: exercise.title,
        prompt_it: content.prompt_it || "",
        audio_url: content.audio_url || null,
        text_it: content.text_it || null,
        timer_seconds: content.timer_seconds || 600,
        level: content.level || "B1",
        questions: questionMap[exercise.id] || [],
        min_words: content.min_words,
        max_words: content.max_words
      };
    });

    // Select one per skill type for demo (free version)
    const skillTypes = ["ascolto", "lettura", "scrittura", "produzione_orale"];
    const finalItems: any[] = [];
    
    for (const skillType of skillTypes) {
      const found = items.find((item: any) => item.type === skillType);
      if (found) {
        finalItems.push(found);
      }
    }

    // If no exercises exist, bootstrap them
    if (finalItems.length === 0) {
      try {
        const bootstrapResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/demo/bootstrap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (bootstrapResponse.ok) {
          // Retry fetching after bootstrap
          return handler(req, res);
        }
      } catch (error) {
        console.error("Bootstrap failed:", error);
      }
    }

    return res.status(200).json({ items: finalItems });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "Impossibile caricare gli esercizi. Riprova." });
  }
}