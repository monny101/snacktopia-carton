-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create admin access function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create staff access function
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'staff')
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (is_admin());

-- Categories table policies
DROP POLICY IF EXISTS "Public read access for categories" ON categories;
CREATE POLICY "Public read access for categories"
ON categories FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Admin full access for categories" ON categories;
CREATE POLICY "Admin full access for categories"
ON categories FOR ALL
USING (is_admin());

-- Subcategories table policies
DROP POLICY IF EXISTS "Public read access for subcategories" ON subcategories;
CREATE POLICY "Public read access for subcategories"
ON subcategories FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Admin full access for subcategories" ON subcategories;
CREATE POLICY "Admin full access for subcategories"
ON subcategories FOR ALL
USING (is_admin());

-- Products table policies
DROP POLICY IF EXISTS "Public read access for products" ON products;
CREATE POLICY "Public read access for products"
ON products FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Admin full access for products" ON products;
CREATE POLICY "Admin full access for products"
ON products FOR ALL
USING (is_admin());

-- Orders table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin/Staff can view all orders" ON orders;
CREATE POLICY "Admin/Staff can view all orders"
ON orders FOR SELECT
USING (is_staff_or_admin());

DROP POLICY IF EXISTS "Admin/Staff can update all orders" ON orders;
CREATE POLICY "Admin/Staff can update all orders"
ON orders FOR UPDATE
USING (is_staff_or_admin());

-- Order items table policies
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
CREATE POLICY "Users can insert their own order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admin/Staff can view all order items" ON order_items;
CREATE POLICY "Admin/Staff can view all order items"
ON order_items FOR SELECT
USING (is_staff_or_admin());

DROP POLICY IF EXISTS "Admin/Staff can update all order items" ON order_items;
CREATE POLICY "Admin/Staff can update all order items"
ON order_items FOR ALL
USING (is_staff_or_admin());

-- Addresses table policies
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
CREATE POLICY "Users can view their own addresses"
ON addresses FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
CREATE POLICY "Users can insert their own addresses"
ON addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
CREATE POLICY "Users can update their own addresses"
ON addresses FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
CREATE POLICY "Users can delete their own addresses"
ON addresses FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all addresses" ON addresses;
CREATE POLICY "Admin can view all addresses"
ON addresses FOR SELECT
USING (is_admin());

-- Chat messages table policies
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
CREATE POLICY "Users can view their own chat messages"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = staff_id);

DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
CREATE POLICY "Users can insert their own chat messages"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() = staff_id);

DROP POLICY IF EXISTS "Admin/Staff can view all chat messages" ON chat_messages;
CREATE POLICY "Admin/Staff can view all chat messages"
ON chat_messages FOR SELECT
USING (is_staff_or_admin());

DROP POLICY IF EXISTS "Admin/Staff can update all chat messages" ON chat_messages;
CREATE POLICY "Admin/Staff can update all chat messages"
ON chat_messages FOR UPDATE
USING (is_staff_or_admin());

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE subcategories;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE addresses;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;