# 🚀 Production Deployment URLs

## Live URLs

### Frontend (Customer App)
**URL:** https://kitchen-peach.vercel.app/
- Deployed on: Vercel
- Purpose: Customer-facing restaurant website
- Features: Browse menu, add to cart, place orders, track orders

### Admin Panel
**URL:** https://kitchen-v2jj.vercel.app/
- Deployed on: Vercel
- Purpose: Restaurant management dashboard
- Features: Manage menu items, categories, orders, users
- Login required (admin credentials)

### Backend API
**URL:** https://kitchen-agpd.onrender.com/
- Deployed on: Render
- Purpose: REST API for frontend and admin
- Features: User auth, menu management, order processing, Stripe payments

## ✅ Configuration Updates Made

### 1. Frontend (`frontend/src/Context/StoreContext.jsx`)
```javascript
const url = "https://kitchen-agpd.onrender.com"
```

### 2. Admin (`admin/src/assets/assets.js`)
```javascript
export const url = 'https://kitchen-agpd.onrender.com'
```

### 3. Backend (`backend/controllers/orderController.js`)
```javascript
const frontend_URL = 'https://kitchen-peach.vercel.app';
```

### 4. Backend CORS (`backend/server.js`)
```javascript
app.use(cors({
    origin: [
        'https://kitchen-peach.vercel.app',
        'https://kitchen-v2jj.vercel.app',
        'http://localhost:5173',  // Local frontend
        'http://localhost:5174'   // Local admin
    ],
    credentials: true
}))
```

## 📋 Environment Variables Needed

### Frontend (Vercel)
```
VITE_SUPABASE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_BUCKET_NAME=restaurant-images
VITE_SUPABASE_STORAGE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co/storage/v1
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

### Admin (Vercel)
```
VITE_SUPABASE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_BUCKET_NAME=restaurant-images
VITE_SUPABASE_STORAGE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co/storage/v1
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

### Backend (Render)
```
PORT=4000
SUPABASE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co
SUPABASE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 🔧 Next Steps

### 1. Deploy Backend to Render
1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Select `backend` folder
5. Add environment variables
6. Deploy

### 2. Redeploy Frontend & Admin
```bash
# Commit the URL changes
git add .
git commit -m "Update production URLs"
git push origin master
```

Both will auto-deploy on Vercel when you push!

### 3. Add Environment Variables
- **Frontend**: Vercel Dashboard → kitchen-peach → Settings → Environment Variables
- **Admin**: Vercel Dashboard → kitchen-v2jj → Settings → Environment Variables
- **Backend**: Render Dashboard → kitchen-agpd → Environment

### 4. Test Everything
- ✅ Frontend loads menu items from Supabase
- ✅ Admin can login and manage items
- ✅ Orders work with Stripe
- ✅ No CORS errors in console

## 🐛 Troubleshooting

### CORS Errors
- Check backend CORS config includes your Vercel URLs
- Verify no trailing slashes in URLs

### API Connection Failed
- Check environment variables are set in Vercel/Render
- Verify Supabase keys are correct
- Check backend is running on Render

### Images Not Loading
- Verify Supabase Storage bucket is public
- Check VITE_SUPABASE_STORAGE_URL is correct

## 📞 Deployment Checklist

- [x] Updated all localhost URLs to production URLs
- [x] Configured CORS for production domains
- [ ] Add environment variables to Vercel (Frontend)
- [ ] Add environment variables to Vercel (Admin)
- [ ] Add environment variables to Render (Backend)
- [ ] Deploy backend to Render
- [ ] Push code changes to trigger Vercel deployments
- [ ] Test login on admin panel
- [ ] Test menu items loading on frontend
- [ ] Test order placement
- [ ] Verify Stripe payments work
- [ ] Check all images load correctly

## 🎉 Success!
Once all checkboxes are complete, your Bhojanalay Cloud Kitchen will be fully live!
