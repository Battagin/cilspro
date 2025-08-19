import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { exercise_id, answers } = await req.json();

    if (!exercise_id || !answers) {
      return new Response(
        JSON.stringify({ error: 'exercise_id e answers são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Grading MCQ for exercise:', exercise_id);

    // Use service role key to access private schema
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch answer key from private schema
    const { data: keyRow, error: keyErr } = await supabase
      .schema('private')
      .from('demo_exercise_keys')
      .select('answer_key')
      .eq('exercise_id', exercise_id)
      .single();

    if (keyErr) {
      console.error('Error fetching answer key:', keyErr);
      return new Response(
        JSON.stringify({ error: 'Gabarito não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!keyRow) {
      return new Response(
        JSON.stringify({ error: 'Gabarito não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const answerKey = keyRow.answer_key;
    console.log('Answer key found for exercise:', exercise_id);

    let correct = 0;
    const correctMap: Record<string, boolean> = {};

    // Grade the answers
    const items = answerKey.items || [];
    for (const item of items) {
      const qid = item.id;
      const expected = item.correct;
      const userAnswer = answers[qid];
      const isCorrect = userAnswer !== undefined && userAnswer === expected;
      correctMap[qid] = isCorrect;
      if (isCorrect) correct++;
    }

    const total = items.length;
    const score = total > 0 ? correct / total : 0;

    console.log(`Grading result: ${correct}/${total} (${Math.round(score * 100)}%)`);

    // Never return the raw answer key
    return new Response(
      JSON.stringify({
        score,
        correct,
        total,
        correctMap
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in grade-mcq function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao corrigir exercício demo' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});