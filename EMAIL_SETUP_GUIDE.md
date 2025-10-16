# 📧 Email Setup Guide - Interview Invitations

## 🚨 Problem: Interview links are not being sent via email

## 🔧 Solutions:

### **Option 1: Gmail Setup (Recommended for Testing)**

1. **Create App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate app password for "Mail"

2. **Add to .env.local:**
```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### **Option 2: SMTP Setup (For Production)**

Add to `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourcompany.com
```

### **Option 3: Development Mode (Fake Email)**

The system will automatically use Ethereal Email (fake SMTP) if no email config is found. Check console for preview URLs.

## 🧪 Testing Email:

1. **Check Environment:**
   - Visit: `http://localhost:3000/api/test-email`
   - Should show which email services are configured

2. **Test Email Sending:**
   - Create interview invitation
   - Check browser console for logs
   - Look for "Preview URL" in development mode

## 🔍 Debug Steps:

1. **Check Console Logs:**
   - Open browser DevTools
   - Look for email sending logs
   - Check for error messages

2. **Check Network Tab:**
   - Look for `/api/send-interview-invitation` request
   - Check response status and body

3. **Manual Test:**
   - Copy interview link from console
   - Test the link manually

## 🎯 Quick Fix:

If email is not working, you can:
1. Copy the interview link from the console
2. Send it manually to the candidate
3. The interview room will work regardless of email

## 📱 Alternative: Direct Link Access

Even without email, candidates can access interviews via:
- Admin panel "Join Interview" button
- Direct link sharing
- Copy link functionality
