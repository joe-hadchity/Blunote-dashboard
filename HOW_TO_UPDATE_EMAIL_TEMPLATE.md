# 📧 How to Update Email Template in Supabase

I've created **2 email templates** for you to choose from:

---

## 📋 Templates Available

### 1. **EMAIL_TEMPLATE_FOR_SUPABASE.html** (Professional with Box)
- Modern card design with shadow
- Header, content, and footer sections
- Full URL shown as backup
- Professional footer with copyright

### 2. **EMAIL_TEMPLATE_MINIMALIST.html** (Ultra Minimalist) ⭐ RECOMMENDED
- Clean, simple design
- No boxes or borders
- White background
- Matches your minimalist website style

---

## 🚀 How to Add to Supabase (Step by Step)

### Step 1: Open the Email Template File

Choose one template and open it:
- For minimalist: `EMAIL_TEMPLATE_MINIMALIST.html`
- For professional: `EMAIL_TEMPLATE_FOR_SUPABASE.html`

### Step 2: Copy the HTML Code

- Open the file
- Select all (Ctrl+A / Cmd+A)
- Copy (Ctrl+C / Cmd+C)

### Step 3: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project
3. Go to: **Authentication** → **Email Templates**
4. Click on: **Confirm signup**

### Step 4: Paste the Template

1. You'll see a text editor
2. Clear all existing content
3. Paste your copied HTML
4. Click **Save**

### Step 5: Test It

1. Sign up with a new email
2. Check your inbox
3. You should see the beautiful new email! ✨

---

## 🎨 Customization Options

### Change Brand Name
Find this line:
```html
<h1 style="...">Bluenote</h1>
```
Replace "Bluenote" with your brand name.

### Change Button Color
Find this line:
```html
background-color: #3b82f6;
```
Replace `#3b82f6` with your brand color:
- Blue: `#3b82f6`
- Green: `#10b981`
- Purple: `#8b5cf6`
- Red: `#ef4444`
- Orange: `#f59e0b`

### Change Text
Find the text you want to change:
```html
<p>Click the button below to verify your email address...</p>
```
Replace with your own text.

---

## 📱 Email Preview

### Minimalist Template Preview:
```
┌─────────────────────────────────┐
│                                 │
│  Bluenote                       │
│                                 │
│  Verify your email              │
│                                 │
│  Click the button below to      │
│  verify your email address and  │
│  activate your account.         │
│                                 │
│  [Verify Email]                 │
│                                 │
│  This link expires in 24 hours. │
│  If you didn't sign up, you     │
│  can ignore this email.         │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  © 2024 Bluenote                │
│                                 │
└─────────────────────────────────┘
```

### Professional Template Preview:
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │         Bluenote            │ │
│ │                             │ │
│ ├─────────────────────────────┤ │
│ │                             │ │
│ │  Verify Your Email          │ │
│ │                             │ │
│ │  Thanks for signing up!     │ │
│ │  Please verify your email   │ │
│ │  address to activate your   │ │
│ │  account...                 │ │
│ │                             │ │
│ │  [Verify Email Address]     │ │
│ │                             │ │
│ │  Or copy this link:         │ │
│ │  ┌───────────────────────┐  │ │
│ │  │ https://yourlink.com  │  │ │
│ │  └───────────────────────┘  │ │
│ │                             │ │
│ │  This link expires in 24    │ │
│ │  hours...                   │ │
│ │                             │ │
│ ├─────────────────────────────┤ │
│ │                             │ │
│ │  © 2024 Bluenote           │ │
│ │  All rights reserved.       │ │
│ │                             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## ✨ Features

Both templates include:
- ✅ Mobile responsive
- ✅ Works in all email clients
- ✅ Clean, modern design
- ✅ Professional appearance
- ✅ Easy to customize
- ✅ Matches your website style

---

## 🎯 Recommended Template

**I recommend: `EMAIL_TEMPLATE_MINIMALIST.html`**

Why?
- ✅ Matches your minimalist website design
- ✅ Clean and simple
- ✅ Fast to load
- ✅ Works everywhere
- ✅ Professional without being busy

---

## 🚨 Troubleshooting

### Email looks weird?
- Some email clients (Gmail, Outlook) may not support all CSS
- The templates use inline styles for maximum compatibility
- Test in multiple email clients

### Button not clickable?
- Make sure `{{ .ConfirmationURL }}` is exactly as shown
- Don't remove the curly braces
- Supabase replaces this with the actual link

### Can't save template?
- Make sure you're in the right section: Authentication → Email Templates → Confirm signup
- Check if you have proper permissions
- Try refreshing the page

---

## 📝 Variables Available

Supabase provides these variables:
- `{{ .ConfirmationURL }}` - The verification link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL

Example usage:
```html
<p>Hi {{ .Email }},</p>
<p>Welcome to {{ .SiteURL }}!</p>
```

---

## 🎨 Advanced Customization

### Add Your Logo

Replace the text logo with an image:
```html
<img src="https://yoursite.com/logo.png" alt="Bluenote" style="height: 32px; width: auto;">
```

### Change Font

Replace the font-family:
```html
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Add Social Links

At the footer:
```html
<p style="margin: 8px 0 0 0;">
    <a href="https://twitter.com/bluenote" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Twitter</a>
    <a href="https://facebook.com/bluenote" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Facebook</a>
</p>
```

---

## ✅ Checklist

- [ ] Choose a template (minimalist recommended)
- [ ] Copy the HTML code
- [ ] Go to Supabase Dashboard
- [ ] Navigate to Email Templates → Confirm signup
- [ ] Paste the code
- [ ] Customize brand name if needed
- [ ] Customize colors if needed
- [ ] Click Save
- [ ] Test with a real signup
- [ ] Check email in inbox
- [ ] Verify link works
- [ ] Done! ✨

---

## 📧 Test the Email

After updating:

1. Go to your signup page
2. Sign up with a **new email** (use a real one)
3. Check your inbox
4. You should see the beautiful new email!
5. Click the verify button
6. Should redirect to your dashboard

---

**Need help?** The templates are ready to use - just copy and paste! 🚀

**Recommended:** Use `EMAIL_TEMPLATE_MINIMALIST.html` for the cleanest look that matches your website perfectly!

