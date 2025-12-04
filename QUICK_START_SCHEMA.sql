-- =====================================================
-- QUICK START - Minimal Tables for Testing
-- Run this in Supabase SQL Editor first
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 2. Items table (menu items)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT ''::text,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES public.categories(id),
  is_vegetarian BOOLEAN DEFAULT false,
  is_anytime_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT items_pkey PRIMARY KEY (id)
);

-- 3. Menu item images table
CREATE TABLE IF NOT EXISTS public.menu_item_images (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT menu_item_images_pkey PRIMARY KEY (id)
);

-- 4. Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT ''::text,
  phone TEXT DEFAULT ''::text,
  role TEXT NOT NULL DEFAULT 'customer'::text CHECK (role = ANY (ARRAY['customer'::text, 'admin'::text])),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  cart_data JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  customer_name TEXT NOT NULL DEFAULT ''::text,
  customer_email TEXT NOT NULL DEFAULT ''::text,
  customer_phone TEXT NOT NULL DEFAULT ''::text,
  order_status TEXT NOT NULL DEFAULT 'pending'::text 
    CHECK (order_status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'delivered'::text, 'cancelled'::text])),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_address TEXT DEFAULT ''::text,
  special_instructions TEXT DEFAULT ''::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

-- 6. Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_category_id ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_images_menu_item_id ON public.menu_item_images(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Disable RLS for testing (enable later in production)
ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.items TO anon, authenticated;
GRANT ALL ON public.menu_item_images TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.orders TO anon, authenticated;
GRANT ALL ON public.order_items TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('Breakfast', 'Morning meals'),
('Lunch', 'Afternoon meals'),
('Dinner', 'Evening meals'),
('Desserts', 'Sweet treats'),
('Beverages', 'Drinks')
ON CONFLICT (name) DO NOTHING;

-- Verify
SELECT 'Tables created successfully!' as status;
SELECT COUNT(*) as category_count FROM public.categories;
