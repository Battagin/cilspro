import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { exercise_id, answers } = await req.json();
    
    if (!exercise_id || !answers) {
      return new Response(JSON.stringify({ error: 'exercise_id e answers são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role key para acessar dados privados
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    console.log('Buscando gabarito para exercise_id:', exercise_id);

    // Buscar gabarito da tabela privada
    const { data: keyRow, error: keyErr } = await supabase
      .schema('private')
      .from('demo_exercise_keys')
      .select('answer_key')
      .eq('exercise_id', exercise_id)
      .single();

    if (keyErr) {
      console.error('Erro ao buscar gabarito:', keyErr);
      return new Response(JSON.stringify({ error: 'Gabarito não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!keyRow || !keyRow.answer_key) {
      return new Response(JSON.stringify({ error: 'Gabarito não disponível' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const answerKey = keyRow.answer_key;
    console.log('Gabarito encontrado, processando respostas...');

    let correct = 0;
    const correctMap: Record<string, boolean> = {};
    const total = Object.keys(answerKey).length;

    // Comparar respostas do usuário com o gabarito
    for (const [questionId, correctAnswer] of Object.entries(answerKey)) {
      const userAnswer = answers[questionId];
      const isCorrect = userAnswer !== undefined && userAnswer === correctAnswer;
      correctMap[questionId] = isCorrect;
      if (isCorrect) correct++;
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    console.log(`Correção concluída: ${correct}/${total} corretas (${score}%)`);

    // Retornar resultado SEM expor o gabarito
    return new Response(JSON.stringify({
      score,
      correct,
      total,
      correctMap
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função grade-mcq:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});