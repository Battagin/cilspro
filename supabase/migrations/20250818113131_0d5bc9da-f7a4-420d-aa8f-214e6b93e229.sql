-- Fix security vulnerability: Restrict subscription updates to own records only
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create new secure update policy that only allows users to modify their own subscription records
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid() OR email = auth.email());