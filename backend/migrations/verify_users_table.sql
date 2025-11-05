-- Verify and fix users table structure
-- Run this in Supabase SQL Editor to ensure users table is properly set up

-- Check if users table exists and create if needed
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    cart_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
DROP POLICY IF EXISTS "Allow admins full access" ON users;

-- Create RLS policies
-- Allow authenticated users to read all users (for admin panel)
CREATE POLICY "Allow authenticated read access to users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to update their own data
CREATE POLICY "Allow users to update their own data"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access"
    ON users FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Check current users (should show results after sign up)
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    created_at 
FROM users 
ORDER BY created_at DESC;

-- If you want to create a test user manually:
-- INSERT INTO users (id, email, full_name, role)
-- VALUES (gen_random_uuid(), 'test@example.com', 'Test User', 'customer');
