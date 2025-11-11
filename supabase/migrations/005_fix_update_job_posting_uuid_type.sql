-- Migration: Fix update_job_posting function UUID type mismatch
-- Description: Fixes the "COALESCE types text and uuid cannot be matched" error
-- by changing p_ai_interview_template parameter to TEXT and handling conversion properly

-- Drop and recreate the function with proper type handling
CREATE OR REPLACE FUNCTION update_job_posting(
    p_job_id UUID,
    p_job_title VARCHAR(255) DEFAULT NULL,
    p_department VARCHAR(255) DEFAULT NULL,
    p_job_description TEXT DEFAULT NULL,
    p_ai_interview_template TEXT DEFAULT NULL,
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
    UPDATE job_postings SET
        job_title = COALESCE(NULLIF(p_job_title, ''), job_title),
        department = COALESCE(NULLIF(p_department, ''), department),
        job_description = COALESCE(NULLIF(p_job_description, ''), job_description),
        ai_interview_template = CASE 
            WHEN p_ai_interview_template IS NULL OR p_ai_interview_template = '' THEN ai_interview_template
            ELSE p_ai_interview_template::uuid
        END,
        interview_mode = COALESCE(NULLIF(p_interview_mode, ''), interview_mode),
        interview_language = COALESCE(NULLIF(p_interview_language, ''), interview_language),
        employment_type = COALESCE(NULLIF(p_employment_type, ''), employment_type),
        experience_level = COALESCE(NULLIF(p_experience_level, ''), experience_level),
        location = COALESCE(NULLIF(p_location, ''), location),
        salary_min = COALESCE(p_salary_min, salary_min),
        salary_max = COALESCE(p_salary_max, salary_max),
        currency = COALESCE(NULLIF(p_currency, ''), currency),
        is_remote = COALESCE(p_is_remote, is_remote),
        status = COALESCE(NULLIF(p_status, ''), status),
        interview_duration = COALESCE(p_interview_duration, interview_duration),
        questions_count = COALESCE(p_questions_count, questions_count),
        difficulty_level = COALESCE(NULLIF(p_difficulty_level, ''), difficulty_level),
        published_at = CASE WHEN p_status = 'active' AND published_at IS NULL THEN NOW() ELSE published_at END
    WHERE id = p_job_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_job_posting TO authenticated;

