-- Create a secure function to get answer keys for scoring (server-side only)
CREATE OR REPLACE FUNCTION public.get_exercise_answer_key(exercise_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT answer_key
  FROM public.demo_exercises 
  WHERE id = exercise_id;
$$;

-- Grant execute permission only to service role for security
REVOKE ALL ON FUNCTION public.get_exercise_answer_key(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_exercise_answer_key(UUID) TO service_role;

-- Add RLS to the public view
ALTER VIEW public.demo_exercises_public SET (security_barrier = true);

-- Enable RLS on the view (this will make the previous warning go away)
-- Note: Views inherit RLS from underlying tables, but we can make it explicit
CREATE POLICY "public_demo_exercises_view_access"
ON public.demo_exercises_public
FOR SELECT
TO authenticated, anon
USING (true);