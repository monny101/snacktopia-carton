-- Fix chat_messages table relationships
ALTER TABLE IF EXISTS public.chat_messages
DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey,
DROP CONSTRAINT IF EXISTS chat_messages_staff_id_fkey;

ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE,
ADD CONSTRAINT chat_messages_staff_id_fkey 
FOREIGN KEY (staff_id) 
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Fix orders table relationships
ALTER TABLE IF EXISTS public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add foreign key relationship for profiles and users
ALTER TABLE public.profiles
ADD FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update RLS policies for chat_messages
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = staff_id);

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

DROP POLICY IF EXISTS "Staff can create messages for chats they're involved in" ON public.chat_messages;
CREATE POLICY "Staff can create messages for chats they're involved in"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = staff_id AND public.is_staff_or_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Staff can update chat messages they're assigned to" ON public.chat_messages;
CREATE POLICY "Staff can update chat messages they're assigned to"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() = staff_id OR public.is_admin_user(auth.uid()));

-- Update RLS policies for orders
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

DROP POLICY IF EXISTS "Staff and admin can modify orders" ON public.orders;
CREATE POLICY "Staff and admin can modify orders"
ON public.orders
FOR UPDATE
USING (public.is_staff_or_admin_user(auth.uid()));
