# Admin Panel - Production Ready

## Features

### ✅ Menu Management
- Add new menu items with image upload to Supabase Storage
- List all menu items with edit/delete functionality
- Dynamic category selection from database
- Image preview before upload
- Form validation

### ✅ Order Management
- View all customer orders
- Update order status (pending, confirmed, preparing, ready, delivered, cancelled)
- Order details with customer information
- Order items list with quantities and prices
- Real-time order updates

### ✅ Category Management (NEW)
- Create new categories dynamically
- Edit existing categories
- Delete categories (with item count validation)
- View item count per category
- Categories are used in Add Items page

### ✅ User Management (NEW)
- View all users with search and filter
- Search by name or email
- Filter by role (admin/customer)
- Promote users to admin role
- Demote admins to customer role
- Delete users
- User statistics dashboard
- Pagination for large user lists

### ✅ Authentication
- Admin-only access with role-based authentication
- Secure login with Supabase Auth
- Protected routes
- Session management

## Setup Instructions

### 1. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create categories table
-- (Run the contents of backend/migrations/create_categories_table.sql)

-- Ensure users table has cart_data column
-- (Run the contents of backend/migrations/add_cart_data_column.sql)
```

### 2. Environment Variables

Make sure `admin/.env` has:
```
VITE_SUPABASE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Install Dependencies

```bash
cd admin
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

## Pages

### Add Items (`/add`)
- Upload product image
- Enter product name, description, price
- Select category from dropdown (dynamically loaded from database)
- Submit to create new menu item

### List Items (`/list`)
- View all menu items in a grid
- Delete items with confirmation
- View item images from Supabase Storage
- Items grouped by category

### Orders (`/orders`)
- View all orders with customer details
- Update order status with dropdown
- View order items and quantities
- Real-time status updates

### Categories (`/categories`) - NEW
- View all categories with item counts
- Add new category with name and description
- Edit existing categories
- Delete categories (validates no items exist)
- Visual category cards

### Users (`/users`) - NEW
- View all users with avatar and details
- Search users by name or email
- Filter by role (admin/customer)
- User statistics (total, admins, customers)
- Make user admin or remove admin role
- Delete users
- Pagination (10 users per page)

## Production Checklist

### ✅ Database
- [x] Supabase PostgreSQL configured
- [x] All tables created (users, menu_items, orders, order_items, categories)
- [x] Row Level Security (RLS) policies set up
- [x] Indexes created for performance

### ✅ Storage
- [x] Supabase Storage bucket created (restaurant-images)
- [x] Public access enabled for menu images
- [x] File upload validation

### ✅ Authentication
- [x] Admin role checking implemented
- [x] Protected routes
- [x] Session management
- [x] Logout functionality

### ✅ Features
- [x] Menu item CRUD operations
- [x] Order management with status updates
- [x] Category management system
- [x] User management system
- [x] Image upload to cloud storage
- [x] Form validation
- [x] Error handling
- [x] Toast notifications

### ✅ UI/UX
- [x] Responsive design
- [x] Loading states
- [x] Error messages
- [x] Success notifications
- [x] Confirmation dialogs
- [x] Empty states
- [x] Search and filters
- [x] Pagination

### ⚠️ TODO for Production
- [ ] Set up custom domain
- [ ] Configure environment variables for production
- [ ] Set up CI/CD pipeline
- [ ] Add analytics
- [ ] Set up error tracking (Sentry)
- [ ] Add audit logs
- [ ] Implement bulk operations
- [ ] Add export functionality (CSV/PDF)
- [ ] Set up automated backups
- [ ] Add email notifications for orders
- [ ] Implement dashboard with charts
- [ ] Add inventory management
- [ ] Set up rate limiting

## API Integration

The admin panel uses the following API modules:

- `menuItemApi` - Menu item CRUD operations
- `orderApi` - Order management
- `userApi` - User management
- `categoryApi` - Category management
- `statsApi` - Dashboard statistics

All APIs are in `src/lib/api.js` and use Supabase client.

## Security

- Admin-only access enforced at API level
- Role-based authentication
- Supabase RLS policies protect data
- Input validation on all forms
- Secure image upload with validation
- Protected routes with auth check

## Performance

- Images stored in Supabase Storage (CDN)
- Lazy loading for images
- Pagination for large data sets
- Optimized queries with indexes
- Client-side caching

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting
```

## Support

For issues or questions:
1. Check the migration files in `backend/migrations/`
2. Verify Supabase configuration
3. Check browser console for errors
4. Verify API responses in Network tab

## License

All Rights Reserved - Bhojanalay Cloud Kitchen
