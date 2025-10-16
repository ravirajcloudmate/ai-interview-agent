# Supabase User Setup Guide

## Problem
AI Agent templates disappear on page refresh because the user doesn't exist in the `users` table in Supabase.

## Solution
You need to create the user record in Supabase. Here are the steps:

### Step 1: Get Your User ID
1. Open your app and login
2. Open browser console (F12)
3. Run this command:
```javascript
console.log('User ID:', JSON.parse(localStorage.getItem('supabase.auth.token')).user.id)
```
4. Copy the User ID

### Step 2: Create User in Supabase
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace `YOUR_USER_ID` and `YOUR_EMAIL`):

```sql
-- Create user record
INSERT INTO users (id, email, full_name, company_id)
VALUES (
  'YOUR_USER_ID',  -- Replace with your actual user ID
  'YOUR_EMAIL@example.com',  -- Replace with your email
  'Your Name',  -- Replace with your name
  NULL  -- Will be set later when you create a company
);
```

### Step 3: Verify User Created
Run this SQL to check:
```sql
SELECT * FROM users WHERE id = 'YOUR_USER_ID';
```

### Step 4: Test AI Agent Module
1. Refresh your app
2. Go to AI Agent module
3. Create a new agent
4. The agent should now save to database
5. Refresh the page - agent should still be there!

## Alternative: Create Company First

If you want to set up a company:

```sql
-- Create a company
INSERT INTO companies (name, domain, industry)
VALUES (
  'Your Company Name',
  'yourcompany.com',
  'Technology'
)
RETURNING id;

-- Then update the user with the company_id
UPDATE users 
SET company_id = 'COMPANY_ID_FROM_ABOVE'
WHERE id = 'YOUR_USER_ID';
```

## Troubleshooting

### Error: "duplicate key value violates unique constraint"
- User already exists in database
- Skip to Step 4

### Error: "permission denied"
- RLS policies might be blocking
- Run the migration SQL again

### Templates still disappear after refresh
- Check if user record was created successfully
- Check console for any errors
- Verify company_id is set (if you created a company)

