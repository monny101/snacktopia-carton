-- Fix email confirmation by using the correct approach
-- Auto-verify new users by creating a trigger
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

-- Set up proper RLS policies for categories table
-- First, enable RLS on the categories table
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow select for all users" ON public.categories;
DROP POLICY IF EXISTS "Allow insert for admins" ON public.categories;
DROP POLICY IF EXISTS "Allow update for admins" ON public.categories;
DROP POLICY IF EXISTS "Allow delete for admins" ON public.categories;

-- Create policies for categories table
-- Everyone can view categories
CREATE POLICY "Allow select for all users"
ON public.categories
FOR SELECT
USING (true);

-- Only admins can insert categories
CREATE POLICY "Allow insert for admins"
ON public.categories
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Only admins can update categories
CREATE POLICY "Allow update for admins"
ON public.categories
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Only admins can delete categories
CREATE POLICY "Allow delete for admins"
ON public.categories
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Set up RLS for products table
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow select for all users" ON public.products;
DROP POLICY IF EXISTS "Allow insert for admins" ON public.products;
DROP POLICY IF EXISTS "Allow update for admins" ON public.products;
DROP POLICY IF EXISTS "Allow delete for admins" ON public.products;

-- Create policies for products table
-- Everyone can view products
CREATE POLICY "Allow select for all users"
ON public.products
FOR SELECT
USING (true);

-- Only admins can insert products
CREATE POLICY "Allow insert for admins"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Only admins can update products
CREATE POLICY "Allow update for admins"
ON public.products
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Only admins can delete products
CREATE POLICY "Allow delete for admins"
ON public.products
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Set up RLS for orders table
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update any order" ON public.orders;

-- Create policies for orders table
-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin' OR role = 'staff'));

-- Users can insert their own orders
CREATE POLICY "Users can insert their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update any order
CREATE POLICY "Admins can update any order"
ON public.orders
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin' OR role = 'staff'));

-- Set up RLS for profiles table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Enable realtime for tables
ALTER PUBLICATION IF EXISTS supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION IF EXISTS supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION IF EXISTS supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION IF EXISTS supabase_realtime ADD TABLE public.profiles;
