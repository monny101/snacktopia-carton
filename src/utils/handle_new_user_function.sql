
-- Function to be loaded by supabase.rpc('update_handle_new_user_function')
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $$
BEGIN
  RAISE LOG 'Creating profile for user: %', NEW.id;
  RAISE LOG 'User metadata: %', NEW.raw_user_meta_data;
  
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  
  RAISE LOG 'Profile created successfully for user: % with role: %', 
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user function for user %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Continue even if there's an error
END;
$$;

-- Ensure trigger is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
