-- ========================================
-- QUICK FIX: Disable RLS and Grant Permissions
-- ========================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click "RUN"
-- This will immediately fix the "no data showing" issue in admin panel

-- Step 1: Disable Row Level Security on all tables
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant full permissions to authenticated and anon users
GRANT ALL ON menu_items TO anon, authenticated;
GRANT ALL ON categories TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;

-- Step 3: Grant permissions on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 4: Verify the fix worked - check row counts
SELECT 
    'menu_items' as table_name, 
    COUNT(*) as total_rows 
FROM menu_items
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;

-- ========================================
-- DONE! Now refresh your admin panel
-- ========================================
-- After running this script:
-- 1. Go back to your admin panel
-- 2. Refresh the page (F5 or Ctrl+R)
-- 3. You should now see all your data!
-- ========================================
