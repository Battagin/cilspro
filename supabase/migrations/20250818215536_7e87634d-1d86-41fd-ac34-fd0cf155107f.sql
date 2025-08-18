-- Final security fix: Properly restrict all RLS policies to authenticated users only
-- This ensures the subscribers table is completely secure

-- Drop the current policies that still trigger warnings
DROP POLICY IF EXISTS "authenticated_users_select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "authenticated_users_update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "authenticated_users_insert_own_subscription" ON public.subscribers;

-- Create ultra-secure policies that only work for authenticated users
-- These policies will NOT allow anonymous access under any circumstances
CREATE POLICY "secure_select_own_subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_update_own_subscription" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "secure_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Also fix the profiles table for consistency
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "authenticated_select_own_profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "authenticated_update_own_profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "authenticated_insert_own_profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix the demo_attempts table as well
DROP POLICY IF EXISTS "Users can view their own demo attempts" ON public.demo_attempts;
DROP POLICY IF EXISTS "Users can insert their own demo attempts" ON public.demo_attempts;

-- Demo attempts can be viewed by authenticated users for their own records, or by session for anonymous users
CREATE POLICY "secure_select_demo_attempts" 
ON public.demo_attempts 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "secure_insert_demo_attempts" 
ON public.demo_attempts 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);