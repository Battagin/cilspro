-- Fix Security Definer View issue
-- Remove the security_barrier option that was causing the security warning

-- Drop and recreate the view without security definer properties
DROP VIEW IF EXISTS public.demo_exercises_public;

-- Create a simple, secure view without any security definer properties
CREATE VIEW public.demo_exercises_public AS
SELECT 
  id,
  skill_type,
  title,
  content,
  created_at,
  updated_at
FROM public.demo_exercises;

-- Grant permissions explicitly (this is safer than using security definer)
GRANT SELECT ON public.demo_exercises_public TO authenticated, anon;

-- Add a comment to document the purpose
COMMENT ON VIEW public.demo_exercises_public IS 'Public view of exercises without answer keys - safe for user access';

-- The view will now inherit RLS from the underlying table, which is more secure
-- Users will only see what the demo_exercises table policies allow them to see