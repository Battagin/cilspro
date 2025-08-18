-- Fix the demo exercises answer key exposure
-- Create separate policies for different access levels

-- First, create a view that excludes answer keys for public access
CREATE OR REPLACE VIEW public.demo_exercises_public AS
SELECT 
  id,
  skill_type,
  title,
  content,
  created_at,
  updated_at
FROM public.demo_exercises;

-- Grant access to the view
GRANT SELECT ON public.demo_exercises_public TO authenticated, anon;

-- Now update the demo exercises table to restrict direct access
DROP POLICY IF EXISTS "Demo exercises content viewable by everyone" ON public.demo_exercises;

-- Only system/admin can access the full table with answer keys
-- Regular users should use the public view instead
CREATE POLICY "admin_only_access_demo_exercises"
ON public.demo_exercises
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);