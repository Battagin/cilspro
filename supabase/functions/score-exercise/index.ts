import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseId, answers } = await req.json();

    if (!exerciseId || !answers) {
      throw new Error('Exercise ID and answers are required');
    }

    // Create Supabase client with service role for secure access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the answer key securely
    const { data: exercise, error } = await supabase
      .from('demo_exercises')
      .select('answer_key')
      .eq('id', exerciseId)
      .single();

    if (error) {
      throw new Error(`Exercise not found: ${error.message}`);
    }

    const answerKey = exercise.answer_key;
    let correct = 0;
    const totalQuestions = Object.keys(answerKey).length;

    // Calculate score
    Object.entries(answerKey).forEach(([questionId, correctAnswer]) => {
      if (answers[questionId] === correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / totalQuestions) * 100);

    console.log(`Exercise ${exerciseId}: ${correct}/${totalQuestions} correct (${score}%)`);

    return new Response(JSON.stringify({ 
      score,
      correct,
      total: totalQuestions,
      passed: score >= 60
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in score-exercise:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      score: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});