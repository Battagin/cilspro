-- CRITICAL SECURITY FIX: Demo exercises answer key protection
-- Fix the vulnerability where students can access answer keys to cheat

-- Drop the overly permissive admin policy
DROP POLICY IF EXISTS "admin_only_access_demo_exercises" ON public.demo_exercises;

-- Create a strict service-role-only policy for system access
-- This ensures ONLY edge functions can access answer keys
CREATE POLICY "system_only_access_demo_exercises"
ON public.demo_exercises
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Block ALL user access to the main table (including admins)
-- Users should ONLY access the public view without answer keys
CREATE POLICY "block_all_user_access_to_answers"
ON public.demo_exercises
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Ensure the public view is properly configured for safe access
-- Grant explicit permissions to the public view
GRANT SELECT ON public.demo_exercises_public TO authenticated, anon;

-- Add a comment to document the security model
COMMENT ON TABLE public.demo_exercises IS 'Contains answer keys - SYSTEM ACCESS ONLY. Users must use demo_exercises_public view.';
COMMENT ON VIEW public.demo_exercises_public IS 'Public view of exercises WITHOUT answer keys - safe for user access.';

-- Verify that our score-exercise function still works by ensuring it can access answer keys
-- (it uses service_role internally so it should work)