# ⚠️ IMPORTANT: Update Supabase Redirect URL

## 🔧 You Must Update This in Supabase Dashboard

### Go to Supabase Dashboard:

1. Visit: https://supabase.com/dashboard
2. Select your project
3. Go to: **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, find:
   ```
   http://localhost:3000/auth/callback
   ```
5. **Change it to:**
   ```
   http://localhost:3000/callback
   ```
6. Click **Save**

### Important:
- The URL changed from `/auth/callback` to `/callback`
- This is because of Next.js route groups
- Must update in Supabase for verification to work

### For Production:
When you deploy, also add:
```
https://yourdomain.com/callback
```

---

## ✅ After Updating

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Clear your browser cache** (Ctrl+Shift+Delete)

3. **Test signup** with a new email

4. **Click verification link** - should now work!

---

**This is required for email verification to work!** ⚠️

