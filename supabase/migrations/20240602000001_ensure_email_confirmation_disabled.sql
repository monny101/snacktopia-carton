-- This migration ensures that email confirmation is disabled
-- It's important for the admin setup to work properly

-- Update auth.identities to confirm all existing email identities
UPDATE auth.identities
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE email_confirmed_at IS NULL;

-- Ensure the admin and staff users are confirmed
UPDATE auth.users
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE email_confirmed_at IS NULL
AND (email = 'admin@mondocartonking.com' OR email = 'staff@mondocartonking.com');
