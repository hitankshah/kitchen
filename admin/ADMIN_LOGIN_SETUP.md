# Admin Login Setup Guide

## Creating Your Admin Account in Supabase

Since the admin panel doesn't have a signup page (for security), you need to create your admin account directly in Supabase.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `lgykzusdozyfbcnhpkgz`
3. Navigate to **Authentication** → **Users**
4. Click **Add User** button
5. Fill in:
   - **Email**: Your admin email (e.g., `admin@bhojanalay.com`)
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Check this box
6. Click **Create User**

7. Now add admin role to this user:
   - Go to **SQL Editor** in Supabase
   - Run this query (replace with your email):

```sql
-- Update user role to admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@bhojanalay.com';

-- Also create entry in users table
INSERT INTO public.users (id, email, full_name, role, created_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  NOW()
FROM auth.users 
WHERE email = 'admin@bhojanalay.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';
```

### Option 2: Using SQL Only

Run this in Supabase SQL Editor:

```sql
-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@bhojanalay.com',
  crypt('YourStrongPassword123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create entry in public users table
INSERT INTO public.users (id, email, full_name, role, created_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  created_at
FROM auth.users 
WHERE email = 'admin@bhojanalay.com';
```

## Login to Admin Panel

1. Start your admin panel:
   ```bash
   cd admin
   npm run dev
   ```

2. Open browser: `http://localhost:5174/login`

3. Login with:
   - **Email**: The email you created above
   - **Password**: The password you set

4. You should be redirected to the admin dashboard!

## Troubleshooting

### "Access denied. Admin privileges required"
- Make sure you ran the SQL to set role to 'admin'
- Check with:
  ```sql
  SELECT email, raw_user_meta_data->>'role' as role 
  FROM auth.users 
  WHERE email = 'admin@bhojanalay.com';
  ```

### "Invalid email or password"
- Double check your password
- Try resetting password in Supabase dashboard

### "Email not confirmed"
- In Supabase Dashboard → Authentication → Users
- Find your user and click "Confirm User"

## Security Notes

⚠️ **Important Security Practices:**

1. **Use Strong Passwords**: Minimum 12 characters with mixed case, numbers, and symbols
2. **Don't Share Credentials**: Keep admin login private
3. **Enable 2FA**: Consider enabling two-factor authentication in Supabase
4. **Monitor Access**: Regularly check login activity in Supabase
5. **Backup Codes**: Save recovery codes in a secure location

## Default Admin Credentials for Testing

For testing purposes only, you can create:
- **Email**: `admin@bhojanalay.com`
- **Password**: `Admin@123456`

⚠️ **Change this password immediately in production!**
