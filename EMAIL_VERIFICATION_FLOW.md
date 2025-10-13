# 📧 Email Verification Flow - Visual Guide

## 🎯 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER SIGNUP FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. USER VISITS SIGNUP PAGE
   ↓
   📍 /signup
   ↓
   [Sign Up Form]
   - First Name
   - Last Name
   - Email
   - Password (with validation)
   - Terms checkbox
   ↓
   [Submit]

2. SIGNUP REQUEST SENT
   ↓
   POST /api/auth/register
   {
     firstName, lastName,
     email, password
   }
   ↓
   [Supabase Auth]
   - Creates user account
   - Email NOT verified yet
   - Sends verification email
   ↓
   Response: requiresEmailVerification = true

3. VERIFICATION PENDING SCREEN
   ↓
   📧 "Check Your Email" Screen Shows:
   ┌──────────────────────────────┐
   │   ✉️  Check Your Email       │
   │                               │
   │   We've sent a link to:      │
   │   user@example.com           │
   │                               │
   │   Next Steps:                │
   │   1. Check inbox             │
   │   2. Find email from app     │
   │   3. Click verification link │
   │   4. Redirected to dashboard │
   │                               │
   │   [Resend Email]             │
   │   [Sign In]                  │
   └──────────────────────────────┘

4. USER RECEIVES EMAIL
   ↓
   📧 Email from Supabase:
   ┌──────────────────────────────┐
   │  Confirm your signup         │
   │                               │
   │  Click to verify:            │
   │  [Confirm Email]             │
   │                               │
   │  Expires in 24 hours         │
   └──────────────────────────────┘

5. USER CLICKS VERIFICATION LINK
   ↓
   http://localhost:3000/auth/callback
     ?token_hash=abc123...
     &type=signup
   ↓
   📍 /auth/callback (React Page)
   ↓
   [Loading State]
   "Verifying your email..."
   🔄 Spinner animation
   ↓
   POST /api/auth/verify-email
   {
     token_hash: "abc123...",
     type: "signup"
   }

6. VERIFICATION API PROCESSES
   ↓
   [Supabase Auth]
   - Validates token
   - Marks email as verified
   - Creates session
   - Returns tokens
   ↓
   [Set Session Cookies]
   - sb-access-token
   - sb-refresh-token

7. SUCCESS SCREEN
   ↓
   ✅ "Email Verified!"
   "Redirecting to dashboard..."
   ↓
   [2 second delay]
   ↓
   → Redirect to /recordings

8. USER IS NOW LOGGED IN
   ✅ Email verified
   ✅ Session active
   ✅ Can access app
```

---

## 🔄 Alternative Flows

### Flow A: Resend Verification Email

```
[Check Your Email Screen]
   ↓
   User clicks: "Resend verification email"
   ↓
   POST /api/auth/resend-verification
   { email: "user@example.com" }
   ↓
   [Supabase Auth]
   - Generates new token
   - Sends new email
   ↓
   ✅ "Email sent! Check inbox"
   ↓
   User receives new verification email
   ↓
   (Continue from step 5 above)
```

### Flow B: Try to Login Without Verification

```
User goes to /signin
   ↓
   Enters email + password
   ↓
   POST /api/auth/login
   ↓
   [Supabase Auth]
   - Checks credentials: ✅
   - Checks email verified: ❌
   ↓
   Error: "Email not confirmed"
   ↓
   Response:
   {
     error: "Please verify your email...",
     emailNotVerified: true
   }
   ↓
   ❌ Shows error message
   "Please verify your email before logging in"
```

### Flow C: Login After Verification

```
User goes to /signin
   ↓
   Enters email + password
   ↓
   POST /api/auth/login
   ↓
   [Supabase Auth]
   - Checks credentials: ✅
   - Checks email verified: ✅
   ↓
   [Create Session]
   - Set cookies
   - Return user data
   ↓
   ✅ Login successful
   ↓
   → Redirect to /recordings
```

---

## 🗂️ File Structure

```
your-app/
├── src/
│   ├── app/
│   │   ├── (full-width-pages)/
│   │   │   └── (auth)/
│   │   │       └── callback/
│   │   │           └── page.tsx          ← ✨ NEW: Verification callback
│   │   └── api/
│   │       └── auth/
│   │           ├── register/
│   │           │   └── route.ts          ← ✏️ MODIFIED: Enable verification
│   │           ├── login/
│   │           │   └── route.ts          ← ✏️ MODIFIED: Check verification
│   │           ├── verify-email/
│   │           │   └── route.ts          ← ✨ NEW: Verify token
│   │           └── resend-verification/
│   │               └── route.ts          ← ✨ NEW: Resend email
│   └── components/
│       └── auth/
│           └── SignUpForm.tsx            ← ✏️ MODIFIED: Add verification UI
│
├── .env.local                             ← ⚙️ CONFIGURE: Add variables
├── EMAIL_VERIFICATION_SETUP_GUIDE.md      ← 📚 Detailed guide
├── EMAIL_VERIFICATION_IMPLEMENTATION.md   ← 📚 Implementation details
├── QUICK_EMAIL_VERIFICATION_SETUP.md      ← 🚀 Quick start
└── EMAIL_VERIFICATION_FLOW.md             ← 📊 This file
```

---

## 🎨 UI Components

### 1. Sign Up Form
**Location:** `/signup`
**File:** `src/components/auth/SignUpForm.tsx`

**States:**
- ✏️ **Form State** - Normal signup form
- ✅ **Verification Sent** - "Check Your Email" screen

### 2. Verification Callback
**Location:** `/auth/callback?token_hash=...&type=signup`
**File:** `src/app/(full-width-pages)/(auth)/callback/page.tsx`

**States:**
- 🔄 **Loading** - "Verifying your email..."
- ✅ **Success** - "Email Verified!"
- ❌ **Error** - "Verification Failed"

### 3. Sign In Form
**Location:** `/signin`
**File:** `src/components/auth/SignInForm.tsx`

**Behavior:**
- Shows error if email not verified
- Successful login if verified

---

## 🔗 API Endpoints

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/auth/register` | POST | Create account | `{firstName, lastName, email, password}` | `{requiresEmailVerification: true}` |
| `/api/auth/verify-email` | POST | Verify email | `{token_hash, type}` | `{user, session}` |
| `/api/auth/resend-verification` | POST | Resend email | `{email}` | `{message: "Email sent"}` |
| `/api/auth/login` | POST | Login | `{email, password}` | `{user}` or `{emailNotVerified: true}` |

---

## 🔐 Security Features

```
┌─────────────────────────────────────┐
│       SECURITY LAYERS               │
└─────────────────────────────────────┘

1. EMAIL VERIFICATION REQUIRED
   ↓
   ✅ Prevents fake accounts
   ✅ Validates email ownership

2. SECURE TOKENS
   ↓
   ✅ One-time use only
   ✅ 24-hour expiration
   ✅ Cryptographically secure

3. HTTPONLY COOKIES
   ↓
   ✅ Cannot be accessed by JS
   ✅ XSS protection

4. REDIRECT VALIDATION
   ↓
   ✅ Only whitelisted URLs
   ✅ Prevents open redirects

5. RATE LIMITING
   ↓
   ✅ Built into Supabase
   ✅ Prevents email spam
```

---

## ⚙️ Configuration Required

### 1. Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Dashboard Settings

**Authentication → Providers → Email:**
- ✅ Enable email provider
- ✅ Confirm email: **ON**

**Authentication → URL Configuration:**
- ✅ Site URL: `http://localhost:3000`
- ✅ Redirect URLs: `http://localhost:3000/auth/callback`

---

## 🧪 Testing Checklist

- [ ] Sign up with real email
- [ ] See "Check Your Email" screen
- [ ] Receive verification email
- [ ] Click verification link
- [ ] See "Email Verified!" message
- [ ] Redirected to dashboard
- [ ] Can login successfully
- [ ] Try login before verifying (should fail)
- [ ] Test resend verification email
- [ ] Check expired token (after 24h)

---

## 🚀 Deployment Checklist

### Development
- [x] Code implemented
- [ ] Environment variables set
- [ ] Supabase configured
- [ ] Tested locally

### Production
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Add production redirect URL in Supabase
- [ ] Configure custom SMTP (recommended)
- [ ] Customize email templates
- [ ] Test in production
- [ ] Monitor Supabase logs

---

## 📊 Data Flow Diagram

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │      │   API    │      │ Supabase │
│ (Browser)│      │ (Server) │      │  (Auth)  │
└────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │
     │  1. Signup      │                  │
     ├────────────────>│                  │
     │                 │  2. Create User  │
     │                 ├─────────────────>│
     │                 │                  │
     │                 │  3. Send Email   │
     │                 │<─────────────────┤
     │  4. Success     │                  │
     │<────────────────┤                  │
     │                 │                  │
     ├─────────────────┴──────────────────┤
     │        5. User checks email         │
     │        6. Clicks verification link  │
     └─────────────────┬──────────────────┘
     │                 │                  │
     │  7. Callback    │                  │
     ├────────────────>│                  │
     │                 │  8. Verify Token │
     │                 ├─────────────────>│
     │                 │                  │
     │                 │  9. Set Verified │
     │                 │<─────────────────┤
     │  10. Success    │                  │
     │<────────────────┤                  │
     │                 │                  │
     │  11. Redirect   │                  │
     │────────────────>│                  │
     │  to Dashboard   │                  │
```

---

## ✨ Summary

**What You Get:**
- ✅ Secure email verification
- ✅ Beautiful user experience
- ✅ Protection against fake accounts
- ✅ Verified email list
- ✅ Professional signup flow
- ✅ Production-ready code

**Setup Time:** ~5 minutes
**Complexity:** Low
**Security:** High
**User Experience:** Excellent

---

## 🎯 Next Steps

1. ⚙️ Configure Supabase (2 min)
2. 📝 Set environment variables (1 min)
3. 🧪 Test the flow (2 min)
4. 🚀 Deploy to production

**See:** `QUICK_EMAIL_VERIFICATION_SETUP.md` for step-by-step instructions.

---

**Ready to go! 🎉**

