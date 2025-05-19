
-- Function to be loaded by supabase.rpc('exec_sql')
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT (SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )) THEN
    RAISE EXCEPTION 'Only admin users can execute arbitrary SQL';
  END IF;
  
  -- Execute the SQL
  EXECUTE sql_query;
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

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
