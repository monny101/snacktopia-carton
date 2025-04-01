-- Disable email confirmation requirement in auth.users
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT now();

-- Update existing users to have confirmed emails
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- Enable realtime for profiles table
alter publication supabase_realtime add table profiles;