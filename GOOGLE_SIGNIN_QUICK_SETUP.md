# 🚀 Google Sign-In Quick Setup (10 Minutes)

## ✅ Code is Ready!

I've already updated your code. Now you just need to configure Google and Supabase!

---

## 📝 Step 1: Google Cloud Console (5 min)

### 1. Create Project
- Go to: https://console.cloud.google.com/
- Click "New Project"
- Name: "Bluenote"
- Click "Create"

### 2. Enable Google+ API
- Search for "Google+ API"
- Click "Enable"

### 3. Configure OAuth Consent Screen
- Go to: **APIs & Services** → **OAuth consent screen**
- Choose: **External**
- Click "Create"
- Fill in:
  - App name: `Bluenote`
  - User support email: `your@email.com`
  - Developer email: `your@email.com`
- Click "Save and Continue"
- **Scopes:** Add `email`, `profile`, `openid`
- Click "Save and Continue"
- **Test users:** Add your Gmail address
- Click "Save and Continue"

### 4. Create OAuth Client
- Go to: **APIs & Services** → **Credentials**
- Click "Create Credentials" → "OAuth client ID"
- Type: **Web application**
- Name: `Bluenote Web`

**Authorized JavaScript origins:**
```
http://localhost:3000
https://bxdegqsladfaczeixnmh.supabase.co
```

**Authorized redirect URIs:**
```
https://bxdegqsladfaczeixnmh.supabase.co/auth/v1/callback
```

- Click "Create"
- **SAVE** the Client ID and Client Secret!

---

## 🔧 Step 2: Supabase Configuration (2 min)

### 1. Enable Google Provider
- Go to: https://supabase.com/dashboard
- Select your project
- Go to: **Authentication** → **Providers**
- Find "Google" and toggle **ON**

### 2. Add Credentials
- **Client ID:** Paste from Google Console
- **Client Secret:** Paste from Google Console
- Click "Save"

---

## 🧪 Step 3: Test It! (1 min)

```bash
# Restart your dev server
npm run dev
```

### Test Sign Up:
1. Go to: http://localhost:3000/signup
2. Click "Google" button
3. Sign in with Google
4. Authorize the app
5. You're redirected and logged in! ✅

### Test Sign In:
1. Go to: http://localhost:3000/signin
2. Click "Google" button
3. Sign in
4. You're logged in and redirected to /recordings! ✅

---

## 🎯 What Works Now

- ✅ Google button on Sign Up page
- ✅ Google button on Sign In page
- ✅ Automatic account creation
- ✅ Email already verified (Google verifies it)
- ✅ Profile data saved (name, email)
- ✅ Secure OAuth 2.0 flow
- ✅ Session cookies set automatically

---

## 🚨 Common Issues

### "Access blocked: This app's request is invalid"
**Fix:** Add yourself as a test user in OAuth consent screen

### "Redirect URI mismatch"
**Fix:** Make sure redirect URI is exactly:
```
https://bxdegqsladfaczeixnmh.supabase.co/auth/v1/callback
```

### "This app isn't verified"
**For testing:** Click "Advanced" → "Go to Bluenote (unsafe)"
**For production:** Submit app for verification in Google Console

---

## 📊 User Data You Get

When users sign in with Google:
- Full name
- Email address (verified)
- Profile picture URL
- Google user ID

Access in your app via `user.user_metadata`

---

## 🌐 Production Setup

When deploying, add to Google Console:

**Authorized JavaScript origins:**
```
https://yourdomain.com
https://bxdegqsladfaczeixnmh.supabase.co
```

**Update .env:**
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth Client ID
- [ ] Copied Client ID and Secret
- [ ] Enabled Google in Supabase
- [ ] Pasted credentials in Supabase
- [ ] Restarted dev server
- [ ] Tested Google sign up
- [ ] Tested Google sign in
- [ ] It works! 🎉

---

## 💡 Pro Tips

1. **Test Users:** In development, only test users can sign in
2. **Verification:** Users signing in with Google don't need email verification
3. **Profile Pictures:** Save the avatar URL for user profiles
4. **Same Email:** If a user has both email/password and Google, Supabase links them automatically

---

## 📚 Full Guide

For detailed instructions, troubleshooting, and advanced features, see:
**`GOOGLE_OAUTH_SETUP_GUIDE.md`**

---

**Ready to set up? Follow the steps above!** 🚀

Takes only 10 minutes and your users will love it! ❤️

