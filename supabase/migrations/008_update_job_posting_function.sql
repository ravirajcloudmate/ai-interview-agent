-- Migration: Normalize update_job_posting function signature
-- Description: Purane overloaded update_job_posting functions drop karke naya version create karta hai

-- Drop all existing overloads of update_job_posting
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT oid, pg_get_function_identity_arguments(oid) AS args
        FROM pg_proc
        WHERE proname = 'update_job_posting'
          AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.update_job_posting(' || func_record.args || ') CASCADE';
    END LOOP;
END $$;

-- Create unified update_job_posting function including interview_duration & questions_count
CREATE OR REPLACE FUNCTION public.update_job_posting(
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
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.job_postings SET
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
        updated_at = NOW(),
        published_at = CASE
            WHEN p_status = 'active' AND published_at IS NULL THEN NOW()
            ELSE published_at
        END
    WHERE id = p_job_id;

    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_job_posting TO authenticated;

