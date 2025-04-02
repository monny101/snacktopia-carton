-- Ensure email confirmation is disabled globally
UPDATE auth.config
SET confirm_email_on_signup = false;

-- Create a trigger to automatically mark new users as email_confirmed=true
CREATE OR REPLACE FUNCTION public.auto_verify_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS auto_verify_users_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER auto_verify_users_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_verify_users();

-- Enable realtime for users table
alter publication supabase_realtime add table public.users;
