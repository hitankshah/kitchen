-- Migration: Create categories table for managing menu item categories
-- This table stores all available categories for menu items

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add comment to table
COMMENT ON TABLE categories IS 'Stores menu item categories';

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Salad', 'Fresh and healthy salads'),
    ('Rolls', 'Delicious rolls and wraps'),
    ('Deserts', 'Sweet treats and desserts'),
    ('Sandwich', 'Sandwiches and subs'),
    ('Cake', 'Cakes and pastries'),
    ('Pure Veg', 'Pure vegetarian dishes'),
    ('Pasta', 'Italian pasta dishes'),
    ('Noodles', 'Asian noodle dishes')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
