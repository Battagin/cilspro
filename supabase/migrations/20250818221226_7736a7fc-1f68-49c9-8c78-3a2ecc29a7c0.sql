-- Fix the conflicting RLS policies issue by making the security model crystal clear
-- The current setup should work but let's make it more explicit and secure

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "block_all_user_access_to_answers" ON public.demo_exercises;
DROP POLICY IF EXISTS "system_only_access_demo_exercises" ON public.demo_exercises;

-- Create a single, clear policy structure:
-- 1. Explicit denial for users (more secure than false conditions)
-- 2. Explicit permission for service role only

-- First, create a RESTRICTIVE policy that blocks ALL user access
-- RESTRICTIVE policies use AND logic, making them safer for blocking
CREATE POLICY "demo_exercises_no_user_access"
ON public.demo_exercises
AS RESTRICTIVE
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Then create a PERMISSIVE policy that allows ONLY service role access
CREATE POLICY "demo_exercises_service_role_only"
ON public.demo_exercises
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add documentation
COMMENT ON POLICY "demo_exercises_no_user_access" ON public.demo_exercises IS 
'RESTRICTIVE policy: Explicitly blocks ALL user access to answer keys. Uses AND logic for maximum security.';

COMMENT ON POLICY "demo_exercises_service_role_only" ON public.demo_exercises IS 
'PERMISSIVE policy: Allows ONLY service role (edge functions) to access answer keys for scoring.';

-- Verify RLS is enabled
ALTER TABLE public.demo_exercises ENABLE ROW LEVEL SECURITY;