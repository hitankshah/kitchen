# Testing User Management

## Why Users Page Shows "No users registered yet"

The Users page fetches real data from your Supabase `users` table. If you haven't registered any users on the frontend yet, the page will be empty.

## How to Test User Management

### Option 1: Register Users via Frontend (Recommended)

1. Open your frontend: `http://localhost:5173`
2. Click "Sign In" button
3. Switch to "Sign Up" tab
4. Register a new user with:
   - Full Name
   - Email
   - Phone
   - Password
5. After registration, go to admin panel
6. Open Users page - you should now see the registered user

### Option 2: Check Existing Users in Supabase

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select "users" table
4. Check if any users exist
5. If users exist but don't show in admin:
   - Check browser console for errors
   - Verify Supabase API key is correct
   - Check RLS policies

### Option 3: Create Test User Manually (SQL)

Run this in Supabase SQL Editor:

```sql
-- Create a test user
INSERT INTO users (id, email, full_name, phone, role, created_at)
VALUES (
    gen_random_uuid(),
    'test@example.com',
    'Test User',
    '+1234567890',
    'customer',
    NOW()
);

-- Create a test admin
INSERT INTO users (id, email, full_name, phone, role, created_at)
VALUES (
    gen_random_uuid(),
    'admin@example.com',
    'Admin User',
    '+0987654321',
    'admin',
    NOW()
);
```

### Option 4: Verify Database Setup

1. Run the SQL file: `backend/migrations/verify_users_table.sql`
2. This will:
   - Create users table if missing
   - Set up indexes
   - Configure RLS policies
   - Show existing users

## Troubleshooting

### Users page shows empty but users exist

**Check Browser Console:**
```
Open DevTools (F12) → Console tab
Look for errors like:
- "Failed to load users"
- Permission errors
- Network errors
```

**Verify Supabase Connection:**
1. Open admin panel
2. Open Network tab in DevTools
3. Navigate to Users page
4. Check for API calls to Supabase
5. Look at response data

**Check RLS Policies:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM users;
```
If this returns no results, RLS policies might be blocking access.

### Users show but can't edit/delete

**Check Admin Authentication:**
- Make sure you're logged in as admin
- Check `role` column in users table
- Verify AuthContext is working

### Changes don't save

**Check Network Tab:**
1. Open DevTools → Network tab
2. Try to update a user
3. Look for failed requests
4. Check error messages in response

## Expected Behavior

### When Empty:
- Shows "No users registered yet" message
- Stats show 0 users
- Table is empty

### With Users:
- Shows all users in table
- Search works
- Filter by role works
- Can promote to admin
- Can delete users
- Shows user avatars with initials
- Pagination works for 10+ users

## Testing Checklist

- [ ] Register user via frontend
- [ ] User appears in admin Users page
- [ ] Search by name works
- [ ] Search by email works
- [ ] Filter by role works
- [ ] Can make user admin
- [ ] Can remove admin role
- [ ] Can delete user
- [ ] Stats update correctly
- [ ] Pagination works

## Common Issues

1. **"Failed to load users" error**
   - Check .env file has correct Supabase credentials
   - Verify Supabase project is active
   - Check internet connection

2. **Empty page with no error**
   - No users registered yet (expected)
   - Register users via frontend

3. **Can't delete/edit users**
   - Check if logged in as admin
   - Verify role in users table
   - Check RLS policies

4. **Users show but no details**
   - Check users table has full_name, phone columns
   - Run verify_users_table.sql migration

## Next Steps

After verifying Users page works:
1. Test Categories page
2. Add menu items with new categories
3. Create test orders
4. Test complete admin workflow
