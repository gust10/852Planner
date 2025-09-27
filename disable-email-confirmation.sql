-- Disable email confirmation for immediate signup
-- Run this in your Supabase SQL Editor or via CLI

-- Update auth configuration to disable email confirmation
UPDATE auth.config 
SET enable_signup = true, 
    enable_confirmations = false 
WHERE id = 'default';

-- Alternative: You can also run this via Supabase CLI:
-- npx supabase db reset --project-ref ktmnbpighqfinfpbyizu
