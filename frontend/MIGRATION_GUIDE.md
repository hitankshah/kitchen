# Migration Guide: Old Auth → Supabase Auth

## Side-by-Side Comparison

### Sign Up

#### ❌ OLD (Backend API)
```javascript
const onLogin = async (e) => {
  e.preventDefault()
  
  let new_url = url + "/api/user/register"
  
  const response = await axios.post(new_url, {
    name,
    email,
    password
  })
  
  if (response.data.success) {
    setToken(response.data.token)
    localStorage.setItem("token", response.data.token)
    setShowLogin(false)
  } else {
    toast.error(response.data.message)
  }
}
```

**Issues:**
- No email verification
- No phone number field
- No input validation
- No rate limiting
- Password stored with backend

#### ✅ NEW (Supabase)
```javascript
const onLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  
  try {
    // Rate limiting
    if (!signupRateLimiter.isAllowed(email)) {
      throw new Error('Too many signup attempts')
    }
    
    // Input validation with Zod
    const validatedData = signUpSchema.parse({
      email: sanitizeInput(email),
      password,
      fullName: sanitizeInput(name),
      phone: sanitizeInput(phone)
    })
    
    // Supabase signup
    await signUp(
      validatedData.email,
      validatedData.password,
      validatedData.fullName,
      validatedData.phone
    )
    
    toast.success("Check your email to verify")
    setShowVerification(true)
  } catch (error) {
    toast.error(error.message)
  } finally {
    setLoading(false)
  }
}
```

**Benefits:**
- ✅ Email verification required
- ✅ Phone number captured
- ✅ Input validation with Zod
- ✅ Rate limiting (3 attempts/hour)
- ✅ Secure password handling
- ✅ Clear error messages

---

### Sign In

#### ❌ OLD
```javascript
const response = await axios.post(url + "/api/user/login", {
  email,
  password
})

if (response.data.success) {
  setToken(response.data.token)
  localStorage.setItem("token", response.data.token)
}
```

**Issues:**
- No rate limiting → brute force attacks
- No input validation
- No email verification check
- Manual token management

#### ✅ NEW
```javascript
try {
  // Rate limiting
  if (!loginRateLimiter.isAllowed(email)) {
    throw new Error('Too many attempts. Wait 15 minutes.')
  }
  
  // Input validation
  const validatedData = signInSchema.parse({
    email: sanitizeInput(email),
    password
  })
  
  // Supabase signin
  await signIn(validatedData.email, validatedData.password)
  
  // Session auto-managed
  localStorage.setItem("supabase_authenticated", "true")
  setShowLogin(false)
} catch (error) {
  // Specific error handling
  if (error.message.includes('Email not confirmed')) {
    toast.error('Please verify your email first')
  } else if (error.message.includes('Invalid login')) {
    toast.error('Wrong email or password')
  }
}
```

**Benefits:**
- ✅ Rate limiting (5 attempts/15 min)
- ✅ Input validation
- ✅ Email verification enforced
- ✅ Auto session management
- ✅ Specific error messages
- ✅ No manual token handling

---

### Password Reset

#### ❌ OLD
**Not available** ❌

#### ✅ NEW
```javascript
const handlePasswordReset = async () => {
  try {
    await resetPassword(data.email)
    toast.success("Reset link sent to email")
    setShowPasswordReset(true)
  } catch (error) {
    toast.error(error.message)
  }
}
```

**Benefits:**
- ✅ Secure password reset via email
- ✅ User confirmation screen
- ✅ No manual entry needed

---

### Email Verification

#### ❌ OLD
**Not available** ❌

#### ✅ NEW
```javascript
// After signup, user sees:
<EmailVerificationView 
  email={email}
  onClose={handleClose}
  onResend={handleResendVerification}
/>

// Can resend if not received:
await resendVerification(data.email)
```

**Benefits:**
- ✅ Visual confirmation screen
- ✅ Can resend verification email
- ✅ Prevents unverified accounts

---

### Security

#### ❌ OLD (None)
- No input sanitization
- No rate limiting
- Plain text password
- No email verification
- Vulnerable to brute force

#### ✅ NEW (Multiple Layers)
```javascript
// 1. Input Sanitization
const sanitized = sanitizeInput(userInput)
// Removes: <script>, javascript:, event handlers, etc.

// 2. Rate Limiting
const limiter = new RateLimiter(maxAttempts, windowMs)
if (!limiter.isAllowed(email)) {
  throw new Error('Too many attempts')
}

// 3. Validation
const validated = schema.parse(data)
// Ensures correct format, length, etc.

// 4. Encryption
// Supabase handles password encryption

// 5. Session Management
// Auto-refresh tokens, secure storage
```

---

## Database Changes

### ❌ OLD (MongoDB)
```javascript
// Backend stored in MongoDB
db.users.create({
  name: "John",
  email: "john@example.com",
  password: "hashed_password",  // Unsafe here
  token: "jwt_token"
})
```

**Issues:**
- Password stored in same DB
- Manual token management
- No built-in security

### ✅ NEW (Supabase)
```sql
-- Supabase Auth Table (managed by Supabase)
auth.users {
  id: UUID
  email: string (encrypted)
  password: string (hashed by Supabase)
  email_confirmed_at: timestamp
  ...
}

-- Your Custom Users Table
users {
  id: UUID (FK to auth.users)
  email: string
  full_name: string
  phone: string
  role: 'customer' | 'admin'
  created_at: timestamp
}
```

**Benefits:**
- ✅ Passwords hashed securely by Supabase
- ✅ Email verification tracked
- ✅ Automatic session management
- ✅ RLS (Row Level Security) available
- ✅ No manual token storage

---

## API Calls Comparison

### ❌ OLD (Multiple Backend Endpoints)
```
POST /api/user/register  → MongoDB insert
POST /api/user/login     → JWT generation
POST /api/user/logout    → Token invalidation
```

**Issues:**
- Multiple endpoints to manage
- Custom auth logic needed
- Scaling challenges

### ✅ NEW (Supabase Handles It)
```javascript
// All done by Supabase:
client.auth.signUp()
client.auth.signInWithPassword()
client.auth.signOut()
client.auth.resetPasswordForEmail()
client.auth.resend()
client.auth.getSession()
client.auth.onAuthStateChange()
```

**Benefits:**
- ✅ Single source of truth
- ✅ Proven auth security
- ✅ Scales automatically
- ✅ No backend logic needed

---

## Error Handling Improvement

### ❌ OLD
```javascript
if (!response.data.success) {
  toast.error(response.data.message)  // Generic message
}
```

### ✅ NEW
```javascript
if (error.message.includes('User already registered')) {
  toast.error('An account with this email already exists')
} else if (error.message.includes('Invalid login credentials')) {
  toast.error('Invalid email or password')
} else if (error.message.includes('Email not confirmed')) {
  toast.error('Please verify your email before signing in')
} else if (error.message.includes('Too many requests')) {
  toast.error('Too many attempts. Wait 15 minutes')
}
```

**Benefits:**
- ✅ Specific, helpful error messages
- ✅ Users know exactly what went wrong
- ✅ Reduced support tickets

---

## User Experience Improvements

| Feature | Old | New |
|---------|-----|-----|
| Email Verification | ❌ None | ✅ Yes |
| Password Reset | ❌ None | ✅ Yes |
| Rate Limiting | ❌ None | ✅ 5/15min login |
| Phone Number | ❌ Not asked | ✅ Required |
| Input Validation | ❌ Basic | ✅ Zod schemas |
| Error Messages | ❌ Generic | ✅ Specific |
| Session Refresh | ❌ Manual | ✅ Automatic |
| Loading States | ❌ Missing | ✅ Included |
| Toast Feedback | ❌ Limited | ✅ Full |
| Guest Checkout | ❌ No | ✅ Yes |

---

## Performance Improvements

### ❌ OLD
- Multiple API calls to backend
- Network latency for each request
- Manual session validation
- No caching

### ✅ NEW
- Direct to Supabase (optimized)
- Auto token refresh
- Built-in caching
- Faster auth checks
- Real-time events available

---

## Migration Checklist

- [x] Removed backend auth API calls
- [x] Added Supabase auth functions
- [x] Added input validation
- [x] Added rate limiting
- [x] Added email verification
- [x] Added password reset
- [x] Added security utilities
- [x] Updated error handling
- [x] Maintained original styling
- [x] Kept backward compatibility
- [x] Added documentation
- [x] Ready for testing

---

## What Users Will Experience

### Before (Old System)
1. Sign up → Account created immediately (no verification)
2. Sign in → No protection from brute force
3. Forgot password → Not possible
4. No phone number capture
5. Generic error messages

### After (New System)
1. ✅ Sign up → Email verification required
2. ✅ Sign in → Protected by rate limiting
3. ✅ Forgot password → Secure reset link sent
4. ✅ Phone number captured for delivery
5. ✅ Clear, specific error messages
6. ✅ Loading feedback while processing
7. ✅ Guest checkout option
8. ✅ Automatic session management

---

**Migration complete! All old auth code replaced with secure Supabase implementation.**
