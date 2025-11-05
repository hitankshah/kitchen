# 🚀 Quick Start - Fix Admin Panel Empty Data

## The Problem
Admin panel shows empty even though you're logged in.

## The Solution (2 Minutes)

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Select your project: `lgykzusdozyfbcnhpkgz`
3. Click **SQL Editor**

### Step 2: Run This Script
Copy and paste this into SQL Editor, then click **Run**:

```sql
-- DISABLE RLS (for testing)
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- GRANT ALL PERMISSIONS
GRANT ALL ON menu_items TO anon, authenticated;
GRANT ALL ON categories TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- CREATE TEST DATA
INSERT INTO categories (name, description, created_at)
SELECT 'Salads', 'Fresh and healthy salads', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Salads');

INSERT INTO categories (name, description, created_at)
SELECT 'Main Course', 'Delicious main dishes', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Main Course');

INSERT INTO categories (name, description, created_at)
SELECT 'Desserts', 'Sweet treats', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_available, created_at, updated_at)
SELECT 
    'Greek Salad',
    'Fresh vegetables with feta cheese',
    8.99,
    'Salads',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1);

-- VERIFY
SELECT 'menu_items' as table_name, COUNT(*) as count FROM menu_items
UNION ALL
SELECT 'categories', COUNT(*) FROM categories;
```

### Step 3: Refresh Admin Panel
1. Go back to your admin panel
2. Press **F5**
3. Click **Categories** - You should see 3 categories!
4. Click **List Items** - You should see 1 menu item!

## ✅ Done!

Your admin panel should now show data.

⚠️ **Note:** This disables security for testing. See `PRODUCTION_READY.sql` to re-enable security later.

## Still Not Working?

1. Check browser console (F12) for errors
2. Visit `/test` page in admin panel
3. Make sure you're logged in
4. Try logging out and back in

## Next Steps

Once everything works:
1. Add more categories
2. Add menu items
3. Test edit and delete
4. Before production, re-enable RLS (see `PRODUCTION_READY.sql`)
