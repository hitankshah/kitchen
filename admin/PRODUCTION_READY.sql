-- ========================================
-- COMPLETE FIX: Admin Panel Data Access
-- ========================================
-- Run this entire script in Supabase SQL Editor
-- This will fix RLS policies and permissions so admin can see all data

-- ========================================
-- STEP 1: Verify Tables Exist
-- ========================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('menu_items', 'categories', 'users', 'orders', 'order_items')
ORDER BY table_name;

-- ========================================
-- STEP 2: Check Current RLS Status
-- ========================================
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('menu_items', 'categories', 'users', 'orders', 'order_items')
ORDER BY tablename;

-- ========================================
-- STEP 3: DISABLE RLS (Temporary - for testing)
-- ========================================
-- This removes all security but helps us test if RLS is the issue
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

-- Grant sequence permissions (for ID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ========================================
-- VERIFICATION: Test if data is accessible
-- ========================================
SELECT 'menu_items' as table_name, COUNT(*) as row_count FROM menu_items
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;

-- ========================================
-- STEP 4: Create Test Data (if tables are empty)
-- ========================================

-- Create test categories if none exist
INSERT INTO categories (name, description, created_at)
SELECT 'Salads', 'Fresh and healthy salads', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Salads');

INSERT INTO categories (name, description, created_at)
SELECT 'Main Course', 'Delicious main dishes', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Main Course');

INSERT INTO categories (name, description, created_at)
SELECT 'Desserts', 'Sweet treats', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

-- Create a test menu item if none exist
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_available, created_at, updated_at)
SELECT 
    'Test Menu Item',
    'This is a test item to verify the database is working',
    9.99,
    'Salads',
    'https://via.placeholder.com/150',
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1);

-- ========================================
-- AFTER TESTING: Re-enable RLS with proper policies
-- ========================================
-- Once you confirm data is showing in admin panel, 
-- uncomment and run the section below to secure your database

/*
-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- MENU ITEMS: Allow everyone to read, authenticated to modify
DROP POLICY IF EXISTS "Public read access" ON menu_items;
CREATE POLICY "Public read access" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert" ON menu_items;
CREATE POLICY "Authenticated insert" ON menu_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update" ON menu_items;
CREATE POLICY "Authenticated update" ON menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated delete" ON menu_items;
CREATE POLICY "Authenticated delete" ON menu_items FOR DELETE TO authenticated USING (true);

-- CATEGORIES: Allow everyone to read, authenticated to modify
DROP POLICY IF EXISTS "Public read access" ON categories;
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert" ON categories;
CREATE POLICY "Authenticated insert" ON categories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update" ON categories;
CREATE POLICY "Authenticated update" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated delete" ON categories;
CREATE POLICY "Authenticated delete" ON categories FOR DELETE TO authenticated USING (true);

-- USERS: Users can see their own data, admins can see all
DROP POLICY IF EXISTS "Users view own data" ON users;
CREATE POLICY "Users view own data" ON users FOR SELECT TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins view all" ON users;
CREATE POLICY "Admins view all" ON users FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Users update own data" ON users;
CREATE POLICY "Users update own data" ON users FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins update all" ON users;
CREATE POLICY "Admins update all" ON users FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
) WITH CHECK (true);

DROP POLICY IF EXISTS "Insert users" ON users;
CREATE POLICY "Insert users" ON users FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins delete" ON users;
CREATE POLICY "Admins delete" ON users FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

-- ORDERS: Users see own orders, admins see all
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all orders" ON orders;
CREATE POLICY "Admins view all orders" ON orders FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Users insert own orders" ON orders;
CREATE POLICY "Users insert own orders" ON orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins update orders" ON orders;
CREATE POLICY "Admins update orders" ON orders FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
) WITH CHECK (true);

-- ORDER ITEMS: Same as orders
DROP POLICY IF EXISTS "View own order items" ON order_items;
CREATE POLICY "View own order items" ON order_items FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins view all order items" ON order_items;
CREATE POLICY "Admins view all order items" ON order_items FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Insert order items" ON order_items;
CREATE POLICY "Insert order items" ON order_items FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
);
*/

-- ========================================
-- FINAL VERIFICATION
-- ========================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('menu_items', 'categories', 'users', 'orders', 'order_items')
ORDER BY tablename;

-- Show all data counts
SELECT 'menu_items' as table_name, COUNT(*) as count FROM menu_items
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ RLS has been DISABLED for testing';
    RAISE NOTICE '✅ All permissions have been granted';
    RAISE NOTICE '✅ Test data has been created (if tables were empty)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. Go back to your admin panel';
    RAISE NOTICE '2. Refresh the page (F5)';
    RAISE NOTICE '3. Navigate to Categories, List Items, or Users';
    RAISE NOTICE '4. You should now see data!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Once everything works, uncomment the RLS section';
    RAISE NOTICE '   at the bottom of this script and run it to re-enable security!';
END $$;
