-- Fix security vulnerability in subscribers table RLS policy
-- Remove email-based access that allows any authenticated user to view 
-- other users' subscription data if they know their email address

-- Drop the current vulnerable SELECT policy
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create a secure SELECT policy that only allows access based on user_id
CREATE POLICY "select_own_subscription_secure" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid());

-- Also update the UPDATE policy for consistency and security
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

CREATE POLICY "update_own_subscription_secure" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid());