-- Fix Security Definer functions issue
-- Remove unnecessary SECURITY DEFINER functions and fix the remaining ones

-- Drop the test functions that are no longer needed
DROP FUNCTION IF EXISTS public.test_answer_key_security();
DROP FUNCTION IF EXISTS public.verify_public_view_works();
DROP FUNCTION IF EXISTS public.get_demo_exercise_content(UUID);

-- The handle_new_user function needs to stay as SECURITY DEFINER because it's a trigger
-- that needs elevated privileges, but let's fix its search path issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public  -- Fix the search path mutable issue
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$;

-- Add a comment explaining why this function needs SECURITY DEFINER
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function - requires SECURITY DEFINER to insert into profiles table on user creation';

-- Verify our edge functions still work by checking if they can access answer keys
-- (they use service_role internally so they should continue working)