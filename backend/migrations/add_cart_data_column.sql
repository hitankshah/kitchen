-- Migration: Add cart_data column to users table for cart functionality
-- This is needed to support the cart operations from the backend

-- Add cart_data column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cart_data JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN users.cart_data IS 'Stores user cart items as JSON object with item IDs as keys and quantities as values';

-- Example cart_data structure:
-- {
--   "uuid-of-menu-item-1": 2,
--   "uuid-of-menu-item-2": 1,
--   "uuid-of-menu-item-3": 5
-- }
