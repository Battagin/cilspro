-- Create table to store demo questions (without answers) if not exists
DO $$ 
BEGIN
  -- Check if table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'demo_questions') THEN
    CREATE TABLE public.demo_questions (
      exercise_id uuid PRIMARY KEY REFERENCES public.demo_exercises(id) ON DELETE CASCADE,
      questions jsonb NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.demo_questions ENABLE ROW LEVEL SECURITY;

    -- Create policy for public access to questions (no answers here)
    CREATE POLICY "demo_questions_public_select" 
    ON public.demo_questions 
    FOR SELECT 
    USING (true);
  END IF;
END $$;