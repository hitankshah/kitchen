# MongoDB to Supabase Migration Complete

## Summary
All MongoDB dependencies have been removed from the backend. The application now uses Supabase for all database operations.

## Changes Made

### 1. Server Configuration
- **File**: `server.js`
- Removed MongoDB connection (`connectDB()`)
- Added Supabase client initialization
- Server now starts without MongoDB dependency

### 2. Controllers Updated

#### foodController.js
- `listFood()`: Uses `supabase.from('menu_items').select()`
- `addFood()`: Uploads images to Supabase Storage, creates menu_items records
- `removeFood()`: Deletes from menu_items table and removes images from Storage

#### userController.js
- `loginUser()`: Uses `supabase.auth.signInWithPassword()`
- `registerUser()`: Uses `supabase.auth.signUp()` and creates user profile in users table
- Removed bcrypt password hashing (handled by Supabase Auth)
- Removed JWT token generation (uses Supabase session tokens)

#### cartController.js
- `addToCart()`: Updates cart_data JSONB column in users table
- `removeFromCart()`: Updates cart_data JSONB column
- `getCart()`: Retrieves cart_data from users table

#### orderController.js
- `placeOrder()`: Creates orders and order_items in Supabase, integrates with Stripe
- `placeOrderCod()`: Creates orders for Cash on Delivery
- `listOrders()`: Retrieves orders with order_items and menu_items relations
- `userOrders()`: Retrieves user-specific orders
- `updateStatus()`: Updates order status in Supabase
- `verifyOrder()`: Updates payment_status based on Stripe verification

### 3. Middleware Updated

#### auth.js
- Changed from JWT verification to Supabase token verification
- Uses `supabase.auth.getUser(token)` to validate authentication
- Sets `req.body.userId` and `req.user` for authenticated routes

### 4. Dependencies
- **Removed**: `mongoose` (MongoDB ODM), `jsonwebtoken` (JWT handling)
- **Kept**: `@supabase/supabase-js`, `validator`, `bcrypt` (for backwards compatibility)

### 5. Environment Variables
Updated `.env` with Supabase credentials:
```
SUPABASE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET_NAME=restaurant-images
```

## Database Schema

### Supabase Tables Used

1. **users**
   - `id` (UUID, primary key)
   - `email` (text)
   - `full_name` (text)
   - `role` (text: 'customer' | 'admin')
   - `cart_data` (JSONB)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **menu_items**
   - `id` (UUID, primary key)
   - `name` (text)
   - `description` (text)
   - `price` (numeric)
   - `category` (text)
   - `image_url` (text)
   - `is_available` (boolean)
   - `is_vegetarian` (boolean)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **orders**
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to users)
   - `total_amount` (numeric)
   - `status` (text: pending|confirmed|preparing|ready|delivered|cancelled)
   - `payment_method` (text: stripe|cod)
   - `payment_status` (text: pending|completed|failed)
   - `delivery_address` (text)
   - `customer_name` (text)
   - `customer_email` (text)
   - `customer_phone` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

4. **order_items**
   - `id` (UUID, primary key)
   - `order_id` (UUID, foreign key to orders)
   - `menu_item_id` (UUID, foreign key to menu_items)
   - `quantity` (integer)
   - `price` (numeric)
   - `created_at` (timestamp)

### Supabase Storage Buckets

- **restaurant-images**: Stores menu item images
  - Path pattern: `menu-items/{timestamp}-{filename}`
  - Public access enabled

## Next Steps

1. **Remove MongoDB Models** (Optional Cleanup)
   - Delete or archive `models/foodModel.js`
   - Delete or archive `models/userModel.js`
   - Delete or archive `models/orderModel.js`
   - Delete or archive `config/db.js`

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Test All Endpoints**
   - User registration and login
   - Menu item CRUD operations
   - Cart operations
   - Order placement and management

4. **Update Frontend/Admin**
   - Ensure they use the updated API response formats
   - Verify authentication token handling
   - Test image URLs from Supabase Storage

## Breaking Changes

### Authentication
- **Before**: Returns JWT token generated with `jsonwebtoken`
- **After**: Returns Supabase session access_token
- **Impact**: Frontend/admin must use Supabase tokens for authentication

### User IDs
- **Before**: MongoDB ObjectId strings (e.g., "507f1f77bcf86cd799439011")
- **After**: UUID strings (e.g., "123e4567-e89b-12d3-a456-426614174000")
- **Impact**: All userId references must use UUIDs

### Menu Item IDs
- **Before**: MongoDB _id field
- **After**: Supabase id field (UUID)
- **Impact**: Frontend/admin must use `id` instead of `_id`

### Image URLs
- **Before**: Local file paths `/uploads/{filename}`
- **After**: Supabase Storage public URLs
- **Impact**: Frontend must use full URLs from image_url field

### Cart Storage
- **Before**: Stored in MongoDB user document
- **After**: Stored in Supabase users.cart_data (JSONB)
- **Impact**: Same structure, different storage mechanism

## Rollback Plan

If you need to rollback to MongoDB:
1. Restore mongoose dependency in package.json
2. Revert controller files from git history
3. Revert server.js to use connectDB()
4. Revert middleware/auth.js to use JWT
5. Update .env to use MongoDB connection string

## Notes

- MongoDB models are still present in the `models/` folder but are no longer used
- The uploads/ folder for local image storage is no longer needed
- JWT_SECRET in .env is no longer used but kept for reference
- bcrypt dependency kept but authentication now handled by Supabase Auth
