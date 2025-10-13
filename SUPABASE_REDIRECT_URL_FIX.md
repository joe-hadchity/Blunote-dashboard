# 🔧 Supabase Redirect URL - "Invalid URL" Error Fix

## ⚠️ Common Issues & Solutions

### Issue: "Please provide a valid URL" error

---

## ✅ Solution 1: Check the Exact Format

Make sure you're entering **exactly** this (no extra spaces):

```
http://localhost:3000/callback
```

**Common mistakes:**
- ❌ `http://localhost:3000/callback/` (trailing slash)
- ❌ `http://localhost:3000 /callback` (space)
- ❌ `https://localhost:3000/callback` (https instead of http)
- ❌ `localhost:3000/callback` (missing http://)
- ✅ `http://localhost:3000/callback` (CORRECT)

---

## ✅ Solution 2: Set Site URL First

You MUST set the **Site URL** before adding redirect URLs:

### Steps:
1. Go to: **Authentication** → **URL Configuration**
2. Find: **Site URL** (at the top)
3. Set it to:
   ```
   http://localhost:3000
   ```
4. Click **Save**
5. Now try adding the redirect URL again

---

## ✅ Solution 3: Use Wildcard (Alternative)

If localhost doesn't work, try adding a wildcard:

```
http://localhost:3000/**
```

This allows ALL routes under localhost:3000

---

## ✅ Solution 4: Add Multiple URLs

Try adding these one by one:

1. First add:
   ```
   http://localhost:3000
   ```
   
2. Then add:
   ```
   http://localhost:3000/callback
   ```

3. Then add (as backup):
   ```
   http://127.0.0.1:3000/callback
   ```

---

## ✅ Solution 5: Check Your Supabase Plan

Some Supabase plans have restrictions. Try:

1. Go to: **Project Settings** → **General**
2. Check your plan (Free/Pro)
3. If on Free tier, you may need to verify email first

---

## 🎯 Recommended Configuration

### In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:** (Add all of these)
```
http://localhost:3000/callback
http://localhost:3000/**
http://127.0.0.1:3000/callback
```

Click **Save** after each one.

---

## 🔄 Alternative: Use Environment Variable

If Supabase won't accept localhost, you can use the default behavior:

### Option A: Let Supabase Use Default
1. Don't add any custom redirect URL
2. Supabase will use the Site URL by default
3. Update your code to handle this

### Option B: Use ngrok for Testing
1. Install ngrok: https://ngrok.com/
2. Run: `ngrok http 3000`
3. Use the ngrok URL (e.g., `https://abc123.ngrok.io/callback`)
4. Add that to Supabase redirect URLs

---

## 🚨 If Nothing Works: Disable Email Verification Temporarily

While testing, you can disable email confirmation:

1. Go to: **Authentication** → **Providers** → **Email**
2. Toggle **OFF**: "Confirm email"
3. Click **Save**
4. Test your app without email verification
5. Re-enable it later when you deploy

---

## 📸 Screenshot Guide

Your Supabase configuration should look like this:

```
┌─────────────────────────────────────────┐
│ Authentication → URL Configuration      │
├─────────────────────────────────────────┤
│                                         │
│ Site URL                                │
│ http://localhost:3000                   │
│                                         │
│ Redirect URLs                           │
│ http://localhost:3000/callback    [×]   │
│ http://localhost:3000/**          [×]   │
│                                         │
│ [Save]                                  │
└─────────────────────────────────────────┘
```

---

## 🔍 Verification Steps

After adding URLs:

1. ✅ Site URL is set to `http://localhost:3000`
2. ✅ At least one redirect URL is added
3. ✅ Clicked "Save"
4. ✅ No error messages
5. ✅ URLs show up in the list

---

## 💡 Quick Test

Try this exact sequence:

1. **Clear everything** in Redirect URLs
2. **Set Site URL** to: `http://localhost:3000`
3. **Save**
4. **Add Redirect URL**: `http://localhost:3000/**` (with wildcard)
5. **Save**
6. **Test signup**

The wildcard `/**` should work for all routes including `/callback`.

---

## 📞 Still Having Issues?

### Check Browser Console:
1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Share them with me

### Check Supabase Logs:
1. Go to: **Logs** in Supabase Dashboard
2. Look for authentication errors
3. Share them with me

### Try Different Browser:
- Sometimes browser extensions block localhost
- Try in Incognito/Private mode
- Try different browser (Chrome → Firefox)

---

## ✨ Working Alternative (No Redirect URL Needed)

You can also modify the code to not require custom redirect URLs:

### Update your register API to use default:

```typescript
// Remove emailRedirectTo completely
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`
    }
    // No emailRedirectTo - uses Site URL
  }
})
```

Then Supabase will redirect to your Site URL automatically.

---

**Let me know which solution works for you!** 🚀

