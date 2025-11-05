# Frontend Supabase Integration Guide

## Summary of Changes

All Supabase functionality from the `cloud` folder has been successfully integrated into the `frontend` folder. The implementation includes login, signup, password reset, email verification, and secure authentication features - **all while maintaining the original layout and styling**.

## Files Created/Modified

### 1. **Dependencies Added** (`package.json`)
- `@supabase/supabase-js` - Supabase JavaScript client
- `react-helmet-async` - Security headers
- `zod` - Input validation

```bash
npm install
```

### 2. **Supabase Configuration** (`src/lib/supabase.js`)
- Initializes Supabase client with localStorage persistence
- Handles environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Storage configuration for file uploads
- Helper functions: `uploadFile()`, `deleteFile()`

### 3. **Input Validation** (`src/lib/validations.js`)
- Zod schemas for:
  - **Sign Up**: Email, password, full name, phone validation
  - **Sign In**: Email and password validation
  - **Password Reset**: Email validation
  - **Guest Info**: Full name, phone, email validation
  - **Orders**: Customer details and delivery address validation

### 4. **Security Utilities** (`src/lib/security.js`)
- Input sanitization (removes script tags, event handlers, etc.)
- Rate limiting for login (5 attempts per 15 minutes)
- Rate limiting for signup (3 attempts per hour)
- CSRF token generation and validation

### 5. **Authentication Context** (`src/Context/AuthContext.jsx`)
Complete auth management with:
- **`signUp(email, password, fullName, phone)`** - User registration with email verification
- **`signIn(email, password)`** - User login with rate limiting
- **`signOut()`** - User logout
- **`resetPassword(email)`** - Password reset via email
- **`resendVerification(email)`** - Resend verification email
- **`continueAsGuest(guestInfo)`** - Guest checkout option
- **User profile management** - Fetches from Supabase users table
- **Rate limiting** - Prevents brute force attacks

### 6. **Updated LoginPopup Component** (`src/components/LoginPopup/LoginPopup.jsx`)
Enhanced with:
- ✅ Supabase authentication (replaces old axios API calls)
- ✅ Email verification screen after signup
- ✅ Password reset flow
- ✅ Phone number field (required for signup)
- ✅ **Maintains original styling** (LoginPopup.css unchanged)
- ✅ Toast notifications for user feedback
- ✅ Loading states for better UX

**Features:**
- Sign Up with email verification
- Sign In with rate limiting protection
- Forgot Password reset flow
- Resend verification email
- Guest checkout option
- Error handling with user-friendly messages

### 7. **Updated App.jsx**
- Wrapped with `<AuthProvider>` to provide auth context to all components
- Maintains all existing routes and functionality

### 8. **Environment Variables** (`.env`)
```
VITE_SUPABASE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_BUCKET_NAME=restaurant-images
VITE_SUPABASE_STORAGE_URL=https://lgykzusdozyfbcnhpkgz.supabase.co/storage/v1
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

## Authentication Flow

### Sign Up
1. User enters: email, password, full name, phone
2. Input validation with Zod schemas
3. Rate limiting check
4. Supabase `auth.signUp()` creates auth user
5. User record inserted into `users` table
6. Verification email sent
7. Email verification screen shown

### Sign In
1. User enters: email, password
2. Rate limiting check (5 attempts per 15 minutes)
3. Supabase `auth.signInWithPassword()`
4. Session stored in localStorage
5. Redirect to home

### Password Reset
1. User clicks "Forgot password?"
2. Enters email address
3. Reset email sent by Supabase
4. User clicks link in email to reset password
5. Can sign in with new password

### Guest Checkout
1. User can continue as guest
2. Enters: name, phone, email
3. No verification required
4. Info stored in local state during session

## Supabase Integration Details

### Validation & Security
- All inputs sanitized using regex patterns
- Zod schemas ensure type safety
- Rate limiting prevents brute force
- CSRF token support for additional security
- Password must contain: lowercase, uppercase, number (minimum 6 characters)
- Phone validation supports international formats

### Session Management
- Automatic token refresh via Supabase
- Session persisted to localStorage
- Auto-login on page reload if session valid
- Clean logout removes session

### Error Handling
- User-friendly error messages
- Specific error handling:
  - "User already registered" → account exists
  - "Invalid login credentials" → wrong email/password
  - "Email not confirmed" → verification needed
  - "Too many requests" → rate limited
  - "Too many login attempts" → try again in 15 mins

### Profile Fetching
- User profile fetched from `users` table
- Fallback profile created if not in DB
- Profile includes: id, email, full_name, phone, role, created_at

## No Layout/Color Changes

✅ All original CSS styles preserved  
✅ LoginPopup.css unchanged  
✅ Button colors: #FF4C24 (orange - original)  
✅ Form styling: same padding, borders, transitions  
✅ Modal background: same overlay effect  
✅ Typography: same fonts and sizes  

## Testing Checklist

- [ ] Install dependencies: `npm install`
- [ ] Check `.env` file has Supabase credentials
- [ ] Test Sign Up with verification email
- [ ] Test Sign In with valid credentials
- [ ] Test rate limiting (5 login attempts locked out)
- [ ] Test Password Reset flow
- [ ] Test Guest Checkout option
- [ ] Verify original styling looks correct
- [ ] Test logout functionality
- [ ] Verify session persists on page reload

## Database Schema

The integration expects these Supabase tables:

### `users` table
```
- id (UUID, primary key)
- email (text)
- full_name (text)
- phone (text)
- role (text: 'customer' or 'admin')
- created_at (timestamp)
```

## Backward Compatibility

- Old token system still supported in `StoreContext`
- localStorage checked for both: `supabase_authenticated` and `token`
- Existing cart API calls still work
- Easy migration path from old to new auth

## Features Included from Cloud

✅ Complete Supabase auth integration  
✅ Email verification  
✅ Password reset  
✅ Rate limiting  
✅ Input validation with Zod  
✅ Security utilities  
✅ User profile management  
✅ Guest checkout  
✅ Session management  
✅ Error handling  

## Next Steps

1. **Database Setup**: Ensure `users` table exists in Supabase with correct schema
2. **Email Configuration**: Configure SMTP in Supabase for email verification
3. **Password Reset**: Set up redirect URL in Supabase for password reset link
4. **Testing**: Test all auth flows with real email
5. **Deployment**: Deploy frontend with Supabase credentials

## Troubleshooting

**"Supabase environment variables are missing"**
- Check `.env` file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

**"Email not sent"**
- Verify Supabase SMTP configuration
- Check spam folder

**"Too many login attempts"**
- Wait 15 minutes before trying again (rate limiting)

**Session not persisting**
- Check localStorage enabled in browser
- Verify VITE_SUPABASE_URL is correct

---

**Integration Complete!** 🎉 All Supabase functionality is now in the frontend folder with original styling preserved.
