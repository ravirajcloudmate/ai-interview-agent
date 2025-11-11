-- Migration: Create RPC functions for job_postings
-- Description: RPC functions banata hai job postings create aur update karne ke liye
-- UUID casting properly handle karta hai

-- Drop existing function if it exists (to handle updates)
-- Drop all possible overloaded versions by querying pg_proc
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Find and drop all versions of create_job_posting function
    FOR func_record IN 
        SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
        FROM pg_proc 
        WHERE proname = 'create_job_posting'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.create_job_posting(' || func_record.args || ') CASCADE';
    END LOOP;
EXCEPTION 
    WHEN OTHERS THEN 
        -- If function doesn't exist or error occurs, continue
        NULL;
END $$;

-- RPC function to create a new job posting
CREATE OR REPLACE FUNCTION create_job_posting(
    p_company_id UUID,
    p_created_by UUID,
    p_job_title VARCHAR(255),
    p_department VARCHAR(255),
    p_job_description TEXT,
    p_ai_interview_template UUID,
    p_interview_mode VARCHAR(50) DEFAULT 'video',
    p_interview_language VARCHAR(10) DEFAULT 'en',
    p_employment_type VARCHAR(50) DEFAULT 'full-time',
    p_experience_level VARCHAR(50) DEFAULT 'mid-level',
    p_location VARCHAR(255) DEFAULT NULL,
    p_salary_min INTEGER DEFAULT NULL,
    p_salary_max INTEGER DEFAULT NULL,
    p_currency VARCHAR(3) DEFAULT 'USD',
    p_is_remote BOOLEAN DEFAULT false,
    p_interview_duration INTEGER DEFAULT 30,
    p_questions_count INTEGER DEFAULT 5,
    p_difficulty_level VARCHAR(20) DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    new_job_id UUID;
BEGIN
    -- p_ai_interview_template is already UUID type, PostgreSQL will auto-cast if needed
    -- But we ensure it's properly handled
    INSERT INTO job_postings (
        company_id,
        created_by,
        job_title,
        department,
        job_description,
        ai_interview_template,
        interview_mode,
        interview_language,
        employment_type,
        experience_level,
        location,
        salary_min,
        salary_max,
        currency,
        is_remote,
        interview_duration,
        questions_count,
        difficulty_level
    ) VALUES (
        p_company_id,
        p_created_by,
        p_job_title,
        p_department,
        p_job_description,
        p_ai_interview_template,
        p_interview_mode,
        p_interview_language,
        p_employment_type,
        p_experience_level,
        p_location,
        p_salary_min,
        p_salary_max,
        p_currency,
        p_is_remote,
        p_interview_duration,
        p_questions_count,
        p_difficulty_level
    ) RETURNING id INTO new_job_id;
    
    RETURN new_job_id;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid UUID format for ai_interview_template: %', p_ai_interview_template;
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to update job posting
-- Drop all possible overloaded versions by querying pg_proc
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Find and drop all versions of update_job_posting function
    FOR func_record IN 
        SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
        FROM pg_proc 
        WHERE proname = 'update_job_posting'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.update_job_posting(' || func_record.args || ') CASCADE';
    END LOOP;
EXCEPTION 
    WHEN OTHERS THEN 
        -- If function doesn't exist or error occurs, continue
        NULL;
END $$;

CREATE OR REPLACE FUNCTION update_job_posting(
    p_job_id UUID,
    p_job_title VARCHAR(255) DEFAULT NULL,
    p_department VARCHAR(255) DEFAULT NULL,
    p_job_description TEXT DEFAULT NULL,
    p_ai_interview_template UUID DEFAULT NULL,
    p_interview_mode VARCHAR(50) DEFAULT NULL,
    p_interview_language VARCHAR(10) DEFAULT NULL,
    p_employment_type VARCHAR(50) DEFAULT NULL,
    p_experience_level VARCHAR(50) DEFAULT NULL,
    p_location VARCHAR(255) DEFAULT NULL,
    p_salary_min INTEGER DEFAULT NULL,
    p_salary_max INTEGER DEFAULT NULL,
    p_currency VARCHAR(3) DEFAULT NULL,
    p_is_remote BOOLEAN DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT NULL,
    p_interview_duration INTEGER DEFAULT NULL,
    p_questions_count INTEGER DEFAULT NULL,
    p_difficulty_level VARCHAR(20) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- p_ai_interview_template is already UUID type, PostgreSQL will auto-cast if needed
    UPDATE job_postings SET
        job_title = COALESCE(p_job_title, job_title),
        department = COALESCE(p_department, department),
        job_description = COALESCE(p_job_description, job_description),
        ai_interview_template = COALESCE(p_ai_interview_template, ai_interview_template),
        interview_mode = COALESCE(p_interview_mode, interview_mode),
        interview_language = COALESCE(p_interview_language, interview_language),
        employment_type = COALESCE(p_employment_type, employment_type),
        experience_level = COALESCE(p_experience_level, experience_level),
        location = COALESCE(p_location, location),
        salary_min = COALESCE(p_salary_min, salary_min),
        salary_max = COALESCE(p_salary_max, salary_max),
        currency = COALESCE(p_currency, currency),
        is_remote = COALESCE(p_is_remote, is_remote),
        status = COALESCE(p_status, status),
        interview_duration = COALESCE(p_interview_duration, interview_duration),
        questions_count = COALESCE(p_questions_count, questions_count),
        difficulty_level = COALESCE(p_difficulty_level, difficulty_level),
        updated_at = NOW()
    WHERE id = p_job_id;
    
    RETURN FOUND;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid UUID format for ai_interview_template: %', p_ai_interview_template;
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_job_posting TO authenticated;
GRANT EXECUTE ON FUNCTION update_job_posting TO authenticated;

