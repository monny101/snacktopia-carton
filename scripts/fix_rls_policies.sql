
-- Create security definer functions for role checks to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT public.get_user_role(user_id) = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
SET search_path = ''
AS $$
  SELECT public.get_user_role(user_id) IN ('admin', 'staff');
$$;

-- Products table RLS policies
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Products are editable by admin and staff" ON public.products;
CREATE POLICY "Products are editable by admin and staff"
ON public.products
FOR ALL
USING (public.is_staff_or_admin_user(auth.uid()));

-- Categories table RLS policies
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Categories are editable by admin and staff" ON public.categories;
CREATE POLICY "Categories are editable by admin and staff"
ON public.categories
FOR ALL
USING (public.is_staff_or_admin_user(auth.uid()));

-- Subcategories table RLS policies
ALTER TABLE IF EXISTS public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON public.subcategories;
CREATE POLICY "Subcategories are viewable by everyone"
ON public.subcategories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Subcategories are editable by admin and staff" ON public.subcategories;
CREATE POLICY "Subcategories are editable by admin and staff"
ON public.subcategories
FOR ALL
USING (public.is_staff_or_admin_user(auth.uid()));

-- Orders table RLS policies
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff and admin can view all orders" ON public.orders;
CREATE POLICY "Staff and admin can view all orders"
ON public.orders
FOR SELECT
USING (public.is_staff_or_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff and admin can update any order" ON public.orders;
CREATE POLICY "Staff and admin can update any order"
ON public.orders
FOR UPDATE
USING (public.is_staff_or_admin_user(auth.uid()));

-- Order items table RLS policies
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Staff and admin can view all order items" ON public.order_items;
CREATE POLICY "Staff and admin can view all order items"
ON public.order_items
FOR SELECT
USING (public.is_staff_or_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own order items" ON public.order_items;
CREATE POLICY "Users can create their own order items"
ON public.order_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Staff and admin can update any order item" ON public.order_items;
CREATE POLICY "Staff and admin can update any order item"
ON public.order_items
FOR UPDATE
USING (public.is_staff_or_admin_user(auth.uid()));

-- Addresses table RLS policies
ALTER TABLE IF EXISTS public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
CREATE POLICY "Users can view their own addresses"
ON public.addresses
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff and admin can view all addresses" ON public.addresses;
CREATE POLICY "Staff and admin can view all addresses"
ON public.addresses
FOR SELECT
USING (public.is_staff_or_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own addresses" ON public.addresses;
CREATE POLICY "Users can create their own addresses"
ON public.addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
CREATE POLICY "Users can update their own addresses"
ON public.addresses
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
CREATE POLICY "Users can delete their own addresses"
ON public.addresses
FOR DELETE
USING (auth.uid() = user_id);

-- Profiles table RLS policies
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff and admin can view all profiles" ON public.profiles;
CREATE POLICY "Staff and admin can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_staff_or_admin_user(auth.uid()));

-- Fixed the policy for updating profiles (removed NEW reference)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Add a separate policy for role restrictions
DROP POLICY IF EXISTS "Regular users can't change their role" ON public.profiles;
CREATE POLICY "Regular users can't change their role"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id AND (
    (public.get_user_role(auth.uid()) = 'customer') OR
    public.is_staff_or_admin_user(auth.uid())
  )
);

DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin_user(auth.uid()));

-- Chat messages table RLS policies
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff and admin can view all chat messages" ON public.chat_messages;
CREATE POLICY "Staff and admin can view all chat messages"
ON public.chat_messages
FOR SELECT
USING (public.is_staff_or_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can create their own chat messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can update chat messages they're assigned to" ON public.chat_messages;
CREATE POLICY "Staff can update chat messages they're assigned to"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() = staff_id OR public.is_admin_user(auth.uid()));

-- Inventory alerts table RLS policies
ALTER TABLE IF EXISTS public.inventory_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and admin can view inventory alerts" ON public.inventory_alerts;
CREATE POLICY "Staff and admin can view inventory alerts"
ON public.inventory_alerts
FOR SELECT
USING (public.is_staff_or_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Staff and admin can manage inventory alerts" ON public.inventory_alerts;
CREATE POLICY "Staff and admin can manage inventory alerts"
ON public.inventory_alerts
FOR ALL
USING (public.is_staff_or_admin_user(auth.uid()));

-- Audit logs table RLS policies
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_admin_user(auth.uid()));
