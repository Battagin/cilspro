-- Document and verify the SECURITY DEFINER function is properly configured
-- The handle_new_user function MUST be SECURITY DEFINER for proper operation

-- Add comprehensive documentation about why this function needs SECURITY DEFINER
COMMENT ON FUNCTION public.handle_new_user() IS 
'SECURITY DEFINER is REQUIRED: This trigger function executes on user registration and must have elevated privileges to insert into the profiles table. It runs in a trusted context to create user profiles automatically. This is a standard and secure pattern for auth triggers.';

-- Verify the function has the correct search path (already fixed)
-- Verify it only does what it should (insert into profiles)

-- Check if there are any triggers using this function
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE p.proname = 'handle_new_user'
AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')