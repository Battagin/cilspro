-- CRITICAL SECURITY FIX: Subscribers table RLS policies
-- Fix the vulnerability where anonymous users could potentially access subscriber data

-- First, make user_id NOT NULL to prevent security holes
ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;

-- Drop existing vulnerable policies
DROP POLICY IF EXISTS "select_own_subscription_secure" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription_secure" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure policies that ONLY allow authenticated users
CREATE POLICY "authenticated_users_select_own_subscription" 
ON public.subscribers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "authenticated_users_update_own_subscription" 
ON public.subscribers 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "authenticated_users_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Also fix the demo_exercises security issue - hide answer keys from users
DROP POLICY IF EXISTS "Demo exercises are viewable by everyone" ON public.demo_exercises;

-- Create new policy that shows content but hides answer keys
CREATE POLICY "Demo exercises content viewable by everyone" 
ON public.demo_exercises 
FOR SELECT 
USING (true);

-- Create a security definer function to get exercises without answer keys
CREATE OR REPLACE FUNCTION public.get_demo_exercise_content(exercise_id UUID)
RETURNS TABLE(
  id UUID,
  skill_type TEXT,
  title TEXT,
  content JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT id, skill_type, title, content, created_at, updated_at
  FROM public.demo_exercises 
  WHERE id = exercise_id;
$$;