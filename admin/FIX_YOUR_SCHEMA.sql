-- ========================================
-- SIMPLE FIX - Disable RLS and Show Data
-- ========================================
-- Copy and run this ENTIRE script in Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON menu_items TO anon, authenticated;
GRANT ALL ON categories TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Add test categories
INSERT INTO categories (name, description, created_at)
VALUES ('Salads', 'Fresh salads', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, description, created_at)
VALUES ('Main Course', 'Main dishes', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, description, created_at)
VALUES ('Desserts', 'Desserts', NOW())
ON CONFLICT DO NOTHING;

-- Add test menu item
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_available, created_at, updated_at)
VALUES (
    'Greek Salad',
    'Fresh vegetables with feta',
    8.99,
    'Salads',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Verify - Check if RLS is actually disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('menu_items', 'categories', 'users', 'orders', 'order_items')
ORDER BY tablename;

-- Check data counts
SELECT 'menu_items' as table_name, COUNT(*) as count FROM menu_items
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- Show first 3 menu items to verify structure
SELECT id, name, category, price, is_available FROM menu_items LIMIT 3;
