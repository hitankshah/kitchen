# Foxy Payment Gateway Integration

## ✅ Status: Stripe Removed, Foxy Integrated

### What Changed
- ❌ **Removed**: Stripe dependency from backend & frontend
- ✅ **Added**: Foxy hosted checkout integration
- ✅ **Backend**: Now generates Foxy form fields and returns redirect payload
- ✅ **Frontend**: Submits order via POST form to Foxy checkout

---

## 🔧 Setup Instructions

### Step 1: Create Foxy Account
1. Go to https://www.foxy.io
2. Sign up and create a store
3. Get your **Store URL** (e.g., `https://your-store.foxycart.com`)

### Step 2: Update Backend Environment Variables

Edit `backend/.env`:

```env
JWT_SECRET=random#secret
FOXY_CHECKOUT_URL=https://your-store.foxycart.com/cart
FOXY_MERCHANT_ID=your_merchant_id_here
SUPABASE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co
SUPABASE_KEY=...
SUPABASE_BUCKET_NAME=restaurant-images
```

**For Production (Render):**
- Go to Render Dashboard → Select Backend Service
- Settings → Environment Variables
- Add:
  - `FOXY_CHECKOUT_URL` = Your Foxy store checkout URL
  - `FOXY_MERCHANT_ID` = Your merchant ID (if needed)

### Step 3: Foxy Store Configuration

In your Foxy dashboard:

1. **Webhook Settings**: Configure return URLs (optional, for order confirmation)
   - Success: `https://kitchen-peach.vercel.app/verify?success=true&orderId={order_id}`
   - Cancel: `https://kitchen-peach.vercel.app/verify?success=false&orderId={order_id}`

2. **Store Settings**: Enable the following
   - Accept hosted checkout POSTs
   - Email notifications on order completion

3. **Product Setup** (optional):
   - Items are passed dynamically via `item_name_X`, `item_price_X`, `item_quantity_X`
   - Foxy will auto-create line items

---

## 🚀 Testing

### Local Testing

1. **Backend** - Ensure Foxy env vars are set:
   ```bash
   cd backend
   npm install  # removes stripe dependency
   npm run server
   ```

2. **Frontend** - Remove Stripe and rebuild:
   ```bash
   cd frontend
   npm install  # removes @stripe/stripe-js
   npm run dev
   ```

3. **Test Flow**:
   - Go to frontend (http://localhost:5173)
   - Add items to cart
   - Go to checkout
   - Select **"Foxy ( Card / Wallet / Hosted Checkout )"** payment option
   - Click "Proceed To Payment"
   - You should be redirected to Foxy hosted checkout

### Production Testing

After deployment to Render + Vercel:

1. Push changes to GitHub
2. Render will auto-rebuild (remove Stripe, use Foxy env vars)
3. Vercel will rebuild frontend (no Stripe dependency)
4. Test with real order flow on production URLs

---

## 📊 Payment Flow

```
Frontend (PlaceOrder)
    ↓
    POST /api/order/place {items, address, paymentMethod: 'foxy'}
    ↓
Backend (orderController.placeOrder)
    ↓
    1. Create order in Supabase
    2. Create order_items in Supabase
    3. Build Foxy form fields (item_name_X, item_price_X, etc.)
    4. Return redirect payload with Foxy URL + fields
    ↓
Frontend (builds hidden form)
    ↓
    POST to Foxy checkout URL with form fields
    ↓
Foxy Hosted Checkout
    ↓
    (customer completes payment)
    ↓
Success URL: /verify?success=true&orderId=...
    ↓
Backend (verifyOrder)
    ↓
    Update order.payment_status = 'completed'
```

---

## 🔍 Troubleshooting

### Issue: "Payment gateway not configured"
- **Cause**: `FOXY_CHECKOUT_URL` not set in env
- **Fix**: Add to `.env` and restart backend

### Issue: Order created but not redirecting to Foxy
- **Cause**: Form not submitting properly
- **Fix**: Check browser console for errors, ensure Foxy URL is valid

### Issue: Order in Supabase but payment marked as pending
- **Cause**: Foxy webhook not configured or success URL not firing
- **Fix**: Implement Foxy webhook listener (optional) or use Foxy dashboard to check payment status

---

## 📦 Dependencies

### Backend Dependencies (Stripe Removed)
```json
{
  "@supabase/supabase-js": "^2.79.0",
  "express": "^4.18.2",
  "body-parser": "^1.20.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.1",
  "multer": "^1.4.5-lts.1",
  "bcrypt": "^5.1.1",
  "validator": "^13.11.0"
}
```

### Frontend Dependencies (Stripe Removed)
```json
{
  "@supabase/supabase-js": "^2.57.4",
  "react": "^18.2.0",
  "axios": "^1.6.7",
  "react-toastify": "^10.0.3"
}
```

---

## ✨ Next Steps

1. ✅ Stripe removed from all dependencies
2. ✅ Foxy integration in backend & frontend
3. ⏳ Set `FOXY_CHECKOUT_URL` in production env vars
4. ⏳ Test end-to-end payment flow
5. ⏳ (Optional) Implement Foxy webhook for automatic order updates

---

## 📞 Support

For Foxy documentation: https://www.foxy.io/documentation
For Foxy checkout fields: https://wiki.foxycart.com/

**Status**: Ready for testing! 🎉
