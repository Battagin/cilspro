-- CRITICAL SECURITY FIX: Profiles table RLS policies
-- Fix the vulnerability where profiles data is accessible to unauthorized users

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "authenticated_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_update_own_profile" ON public.profiles;

-- Make user_id NOT NULL to prevent security holes (if not already)
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Create ultra-secure policies that ONLY allow access to profile owners
CREATE POLICY "secure_profiles_select_own_only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_profiles_update_own_only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "secure_profiles_insert_own_only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add DELETE policy for completeness (users can delete their own profile)
CREATE POLICY "secure_profiles_delete_own_only" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Ensure no anonymous access is possible
-- The policies above use "TO authenticated" which blocks all anonymous access

-- Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;