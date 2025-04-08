
-- Create a superadmin user with email: admin@admin.com and password: admin
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create a new user in auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    'admin@admin.com',
    crypt('admin', gen_salt('bf')),
    now(),
    '{"full_name": "Super Admin", "role": "admin"}'
  ) RETURNING id INTO new_user_id;

  -- Create a profile for the new user
  INSERT INTO public.profiles (
    id,
    full_name,
    role
  ) VALUES (
    new_user_id,
    'Super Admin',
    'admin'
  );

  RAISE NOTICE 'Created super admin user with ID: %', new_user_id;
END
$$;

-- Create storage policies
DROP POLICY IF EXISTS "Allow authenticated users to read buckets" ON storage.buckets;
CREATE POLICY "Allow authenticated users to read buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Allow authenticated users to read objects" ON storage.objects;
CREATE POLICY "Allow authenticated users to read objects" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Allow authenticated users to upload objects" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload objects" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (TRUE);

-- Allow profile reading for all users
DROP POLICY IF EXISTS "Allow users to read all profiles" ON public.profiles;
CREATE POLICY "Allow users to read all profiles"
ON public.profiles
FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create the products bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'products', 'products', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'products');

SELECT 'Setup completed successfully!' AS result;
