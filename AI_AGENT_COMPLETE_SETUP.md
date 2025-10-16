# AI Agent Module - Complete Setup Guide

## Problem
AI Agents save locally but disappear on refresh because the user doesn't exist in the `users` table in Supabase.

## Complete Solution

### Step 1: Run Database Migrations

Run these SQL scripts in Supabase SQL Editor in order:

#### 1.1 Create User Trigger (Run First)
File: `supabase/migrations/2025-10-13_create_user_trigger.sql`

This creates a trigger that automatically creates user records when someone signs up.

#### 1.2 Create AI Agents Table
File: `supabase/migrations/2025-10-13_ai_agents_schema.sql`

This creates the `prompt_templates` table for storing AI agents.

### Step 2: Test the Setup

#### Option A: Sign Up a New User (Recommended)
1. Go to your app's signup page
2. Create a new account with:
   - Full Name
   - Company Name
   - Email
   - Password
3. The trigger will automatically:
   - Create user in `users` table
   - Create company in `companies` table
   - Link user to company

#### Option B: Create User Manually (For Existing Users)
If you already have an auth user but no record in `users` table:

1. Get your User ID:
   - Open browser console (F12)
   - Run: `localStorage.getItem('supabase.auth.token')`
   - Copy the `user.id` value

2. Run this SQL in Supabase:
```sql
-- Replace YOUR_USER_ID and YOUR_EMAIL with actual values
INSERT INTO users (id, email, full_name, company_id)
VALUES (
  'YOUR_USER_ID',
  'YOUR_EMAIL@example.com',
  'Your Name',
  NULL
);
```

### Step 3: Verify Setup

1. **Check User Record:**
```sql
SELECT * FROM users WHERE id = 'YOUR_USER_ID';
```

2. **Check Company Record (if created):**
```sql
SELECT * FROM companies;
```

3. **Test AI Agent Creation:**
   - Go to AI Agent module
   - Click "Create New Agent"
   - Fill in details
   - Click "Save Template"
   - Check console for: "Template saved to database with ID: [uuid]"
   - Refresh the page - agent should still be there!

### Step 4: Verify Database Saving

Run this SQL to check if agents are being saved:
```sql
SELECT * FROM prompt_templates ORDER BY created_at DESC;
```

You should see your saved agents!

## Troubleshooting

### Issue: "permission denied for table users"
**Fix:** Run the user trigger migration

### Issue: "relation prompt_templates does not exist"
**Fix:** Run the AI agents schema migration

### Issue: Templates still disappear after refresh
**Fix:** 
1. Check if user exists: `SELECT * FROM users WHERE id = 'YOUR_USER_ID';`
2. If no user, create one manually (see Option B above)
3. Check console for any errors

### Issue: "duplicate key value violates unique constraint"
**Fix:** User already exists, skip to Step 3

## Expected Flow

### Sign Up Flow:
1. User signs up → `auth.users` record created
2. Trigger fires → `users` table record created
3. Trigger fires → `companies` table record created
4. User linked to company
5. User can now save AI Agents to database

### AI Agent Creation Flow:
1. User clicks "Create New Agent"
2. Fills in form
3. Clicks "Save Template"
4. System checks if user has `company_id`
5. If yes → Save to `prompt_templates` table
6. If no → Save locally (with warning)
7. Template appears in library
8. Refresh page → Template persists (if saved to database)

## Migration Files

1. `2025-10-13_create_user_trigger.sql` - Auto-creates users
2. `2025-10-13_ai_agents_schema.sql` - Creates AI agents table

## Quick Test

After running migrations:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if table exists
SELECT * FROM prompt_templates LIMIT 1;

-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'prompt_templates';
```

All should return results if setup is complete!

