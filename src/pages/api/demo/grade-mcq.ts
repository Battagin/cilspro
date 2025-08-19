import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const { exercise_id, answers } = req.body;

    if (!exercise_id || !answers) {
      return res.status(400).json({ error: "Parametri mancanti" });
    }

    // Call the existing grade-mcq edge function
    const { data, error } = await supabase.functions.invoke('grade-mcq', {
      body: { exercise_id, answers }
    });

    if (error) {
      console.error("Error calling grade-mcq function:", error);
      return res.status(500).json({ error: "Errore durante la valutazione" });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Grading error:', error);
    return res.status(500).json({ error: "Errore durante la valutazione" });
  }
}