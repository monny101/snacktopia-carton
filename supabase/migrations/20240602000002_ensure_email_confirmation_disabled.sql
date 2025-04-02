-- This migration ensures that email confirmation is disabled
-- It's important for the admin setup to work properly

-- Note: The previous migration attempted to update columns that don't exist
-- This migration has been modified to be compatible with the current schema

-- Instead of updating non-existent columns, we'll use the Supabase auth.config table
-- to ensure email confirmation is disabled globally

UPDATE auth.config
SET confirm_email_on_signup = false;
