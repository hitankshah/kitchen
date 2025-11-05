# Troubleshooting: Admin Panel Shows Empty Data

## Problem
After logging into the admin panel, all pages (Categories, Users, List Items, Orders) show empty - no data is displayed even though data exists in Supabase.

## Root Cause
This is almost always caused by **Row Level Security (RLS)** policies in Supabase that are either:
1. Not configured correctly for authenticated users
2. Missing entirely
3. Too restrictive for admin access

## Solution Steps

### Step 1: Run the RLS Fix SQL

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file `FIX_RLS_POLICIES.sql` from the admin folder
4. Copy and paste the entire content
5. Click **Run** (or press Ctrl+Enter)

This will:
- ✅ Create proper RLS policies for all tables
- ✅ Grant correct permissions to authenticated users
- ✅ Allow admins to view/edit all data

### Step 2: Verify RLS Policies

Run this query in Supabase SQL Editor:

```sql
-- Check all policies
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('menu_items', 'categories', 'users', 'orders', 'order_items')
ORDER BY tablename, cmd;
```

You should see policies for SELECT, INSERT, UPDATE, and DELETE on each table.

### Step 3: Check Browser Console

1. Open admin panel: `http://localhost:5174`
2. Login with your admin credentials
3. Open Browser DevTools (F12)
4. Go to **Console** tab
5. Navigate to any page (Categories, Users, etc.)

Look for these logs:
- ✅ `🔍 Fetching categories...` (or users, menu items, etc.)
- ✅ `Auth session: Authenticated`
- ✅ `✅ Categories fetched: X items`

If you see:
- ❌ `❌ Error fetching categories:`
- Look at the error details - it will tell you exactly what's wrong

### Step 4: Common Error Messages

#### Error: "new row violates row-level security policy"
**Solution:** RLS policies are too restrictive. Run `FIX_RLS_POLICIES.sql`

#### Error: "permission denied for table [table_name]"
**Solution:** Grants are missing. Run these:
```sql
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
```

#### Error: "JWT expired" or "Invalid token"
**Solution:** Your session expired. Logout and login again.

#### Error: "relation [table_name] does not exist"
**Solution:** Table doesn't exist. Check table names in Supabase → Table Editor

### Step 5: Test Data Access Directly

Run these queries in Supabase SQL Editor while logged in:

```sql
-- Test if data exists
SELECT COUNT(*) FROM menu_items;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;

-- If counts are 0, add test data
INSERT INTO categories (name, description) 
VALUES ('Test Category', 'Test description');

INSERT INTO menu_items (name, description, price, category, image_url)
VALUES ('Test Item', 'Test desc', 9.99, 'Test Category', 'https://example.com/image.jpg');
```

### Step 6: Nuclear Option (Testing Only)

⚠️ **WARNING: This disables all security! Only use for testing!**

If nothing else works, temporarily disable RLS:

```sql
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

If this makes data appear:
- ✅ Confirms RLS was the issue
- ❌ But now you have no security!
- 🔧 Re-enable RLS and fix policies:

```sql
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

Then run `FIX_RLS_POLICIES.sql` again.

## Debugging Checklist

- [ ] Ran `FIX_RLS_POLICIES.sql` in Supabase SQL Editor
- [ ] Verified policies exist with the verification query
- [ ] Checked browser console for error messages
- [ ] Confirmed I'm logged in (check Navbar shows email)
- [ ] Verified data exists in Supabase Table Editor
- [ ] Checked .env file has correct Supabase credentials
- [ ] Tried logging out and logging back in
- [ ] Cleared browser cache and localStorage
- [ ] Restarted dev server (`npm run dev`)

## Still Not Working?

### Check Authentication

```javascript
// Add this to any page component temporarily
useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    console.log('Current session:', data.session);
    console.log('User email:', data.session?.user?.email);
    console.log('User metadata:', data.session?.user?.user_metadata);
  };
  checkAuth();
}, []);
```

### Check Supabase Client

```javascript
// Add to api.js temporarily
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Supabase client initialized:', !!supabase);
```

## Prevention

To avoid this in the future:

1. **Always create RLS policies** when creating tables
2. **Test with authenticated user** before deploying
3. **Use proper grants** for each role (authenticated, anon)
4. **Document policies** for your team
5. **Monitor Supabase logs** for permission errors

## Quick Fix Command

Run this single query to fix everything:

```sql
-- Quick fix: Grant all permissions and create basic policies
DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['menu_items', 'categories', 'users', 'orders', 'order_items'])
    LOOP
        EXECUTE format('GRANT ALL ON %I TO authenticated', tbl);
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated" ON %I', tbl);
        EXECUTE format('CREATE POLICY "Allow all for authenticated" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;
```

This creates a simple "allow all" policy for authenticated users on all tables.
