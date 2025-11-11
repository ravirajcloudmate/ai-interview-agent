-- Migration: Add interview_duration and questions_count to job_postings
-- Description: Adds new interview configuration columns to existing job postings table

ALTER TABLE public.job_postings
ADD COLUMN IF NOT EXISTS interview_duration integer DEFAULT 30;

ALTER TABLE public.job_postings
ADD COLUMN IF NOT EXISTS questions_count integer DEFAULT 5;

-- Backfill NULL values to ensure consistent defaults
UPDATE public.job_postings
SET interview_duration = COALESCE(interview_duration, 30),
    questions_count = COALESCE(questions_count, 5);

