-- Fix critical security issue: Restrict subscription creation to authenticated users only
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create new policy that only allows authenticated users to create subscriptions
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());