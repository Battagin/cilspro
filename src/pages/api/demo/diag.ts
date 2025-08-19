import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  try {
    const out: any = { ok: true, checks: {} };

    // SECRETS
    out.checks.secrets = {
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      has_GEMINI_KEY: !!process.env.GEMINI_API_KEY,
      has_APP_BASE_URL: !!process.env.APP_BASE_URL,
      has_DEMO_ASCOLTO_AUDIO_URL: !!process.env.DEMO_ASCOLTO_AUDIO_URL
    };

    // SUPABASE SERVICE
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      out.ok = false;
      out.error = "Missing Supabase service secrets";
      return res.status(200).json(out);
    }
    const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

    // VIEW e colunas
    const v = await supa.from("demo_exercises_public").select("id,skill_type,title").limit(1);
    out.checks.view_demo_exercises_public = { error: v.error ? v.error.message : null, sample: v.data?.[0] || null };

    // Tabelas essenciais
    const q = await supa.from("demo_questions").select("exercise_id").limit(1);
    out.checks.table_demo_questions = { error: q.error ? q.error.message : null, exists: !q.error };

    // Check demo_exercises table directly
    const e = await supa.from("demo_exercises").select("id,skill_type").limit(1);
    out.checks.table_demo_exercises = { error: e.error ? e.error.message : null, exists: !e.error };

    // Conteúdo atual
    const all = await supa.from("demo_exercises_public").select("id,skill_type").order("id", { ascending: true });
    out.checks.current_items = all.data || [];
    out.checks.counts_by_type = (all.data || []).reduce((acc: any, r: any) => { 
      const type = r.skill_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1; 
      return acc; 
    }, {});

    // Test Gemini API if key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        const MODEL = process.env.GEMINI_MODEL_TEXT || "gemini-1.5-flash";
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
        const testResponse = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
            contents: [{ role: "user", parts: [{ text: "Respond with just: {\"test\":\"ok\"}" }] }]
          })
        });
        const geminiResult = await testResponse.json();
        out.checks.gemini_api = {
          working: !geminiResult.error,
          status: testResponse.status,
          error: geminiResult.error?.message || null
        };
      } catch (e: any) {
        out.checks.gemini_api = { working: false, error: e.message };
      }
    }

    return res.status(200).json(out);
  } catch (e: any) {
    return res.status(200).json({ ok: false, error: e.message || String(e) });
  }
}