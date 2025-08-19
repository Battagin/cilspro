import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    // Read from public view
    const { data, error } = await supabase
      .from("demo_exercises_public")
      .select("id, title, skill_type, content, created_at, updated_at")
      .order("skill_type", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Impossibile caricare gli esercizi. Riprova." });
    }

    // Transform data for frontend
    const items = (data || []).map((exercise: any) => {
      const content = exercise.content || {};
      return {
        id: exercise.id,
        type: exercise.skill_type,
        title: exercise.title,
        prompt_it: content.prompt_it || "",
        audio_url: content.audio_url || null,
        text_it: content.text_it || null,
        timer_seconds: content.timer_seconds || 600,
        level: content.level || "B1",
        questions: content.questions || [],
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

    return res.status(200).json({ items: finalItems });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "Impossibile caricare gli esercizi. Riprova." });
  }
}