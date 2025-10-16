-- Realtime Setup for Supabase
-- This file enables realtime subscriptions for all relevant tables

-- Enable realtime for job_postings table
ALTER PUBLICATION supabase_realtime ADD TABLE job_postings;

-- Enable realtime for users table (for company changes)
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Enable realtime for companies table
ALTER PUBLICATION supabase_realtime ADD TABLE companies;

-- Enable realtime for interviews table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interviews') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE interviews;
    END IF;
END $$;

-- Enable realtime for interview_reports table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interview_reports') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE interview_reports;
    END IF;
END $$;

-- Enable realtime for candidates table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidates') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE candidates;
    END IF;
END $$;

-- Enable realtime for applications table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE applications;
    END IF;
END $$;

-- Verify realtime is enabled
SELECT schemaname, tablename, pubname 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
ORDER BY tablename;
