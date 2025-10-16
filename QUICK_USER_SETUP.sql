-- QUICK USER SETUP FOR AI AGENT MODULE
-- Run this in Supabase SQL Editor to enable database saving

-- Step 1: Get your user ID from auth.users
-- Go to Supabase Dashboard → Authentication → Users
-- Copy your user ID

-- Step 2: Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- Replace 'YOUR_EMAIL_HERE' with your actual email

INSERT INTO users (id, email, full_name, company_id)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID from auth.users
  'YOUR_EMAIL_HERE',    -- Replace with your email
  'Test User',          -- Replace with your name
  NULL                  -- Will be set later
);

-- Step 3: Verify the user was created
SELECT * FROM users WHERE id = 'YOUR_USER_ID_HERE';

-- Step 4: (Optional) Create a company and link it
-- Uncomment the lines below and replace values:

/*
-- Create a test company
INSERT INTO companies (name, domain, industry)
VALUES ('Test Company', 'test.com', 'Technology')
RETURNING id;

-- Then update the user with the company_id
UPDATE users 
SET company_id = 'COMPANY_ID_FROM_ABOVE'
WHERE id = 'YOUR_USER_ID_HERE';
*/

-- After running this:
-- 1. Refresh your app
-- 2. Create an AI Agent
-- 3. Refresh the page - agent should persist!

