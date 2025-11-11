-- Migration: Create job_postings table
-- Description: Job postings table banata hai
-- `ai_interview_template` column se prompt_templates table connect hota hai
-- Job details, salary, location, interview settings store hoti hain

-- Create job_postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  created_by uuid NOT NULL,
  job_title character varying(255) NOT NULL,
  department character varying(255) NOT NULL,
  job_description text NOT NULL,
  ai_interview_template uuid NULL,
  interview_mode character varying(50) NOT NULL DEFAULT 'video'::character varying,
  interview_language character varying(10) NOT NULL DEFAULT 'en'::character varying,
  employment_type character varying(50) NULL DEFAULT 'full-time'::character varying,
  experience_level character varying(50) NULL DEFAULT 'mid-level'::character varying,
  location character varying(255) NULL,
  salary_min integer NULL,
  salary_max integer NULL,
  currency character varying(3) NULL DEFAULT 'USD'::character varying,
  status character varying(20) NULL DEFAULT 'draft'::character varying,
  is_remote boolean NULL DEFAULT false,
  applications_count integer NULL DEFAULT 0,
  interview_duration integer NULL DEFAULT 30,
  questions_count integer NULL DEFAULT 5,
  difficulty_level character varying(20) NULL DEFAULT 'medium'::character varying,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  published_at timestamp with time zone NULL,
  expires_at timestamp with time zone NULL,
  CONSTRAINT job_postings_pkey PRIMARY KEY (id),
  CONSTRAINT job_postings_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT job_postings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT job_postings_ai_interview_template_fkey FOREIGN KEY (ai_interview_template) REFERENCES prompt_templates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT job_postings_interview_language_check CHECK (
    (
      (interview_language)::text = ANY (
        (
          ARRAY[
            'en'::character varying,
            'es'::character varying,
            'fr'::character varying,
            'de'::character varying,
            'hi'::character varying,
            'zh'::character varying
          ]
        )::text[]
      )
    )
  ),
  CONSTRAINT job_postings_interview_mode_check CHECK (
    (
      (interview_mode)::text = ANY (
        (
          ARRAY[
            'video'::character varying,
            'audio'::character varying,
            'text'::character varying
          ]
        )::text[]
      )
    )
  ),
  CONSTRAINT job_postings_status_check CHECK (
    (
      (status)::text = ANY (
        (
          ARRAY[
            'draft'::character varying,
            'active'::character varying,
            'paused'::character varying,
            'closed'::character varying
          ]
        )::text[]
      )
    )
  ),
  CONSTRAINT job_postings_difficulty_level_check CHECK (
    (
      (difficulty_level)::text = ANY (
        (
          ARRAY[
            'easy'::character varying,
            'medium'::character varying,
            'hard'::character varying
          ]
        )::text[]
      )
    )
  ),
  CONSTRAINT job_postings_employment_type_check CHECK (
    (
      (employment_type)::text = ANY (
        (
          ARRAY[
            'full-time'::character varying,
            'part-time'::character varying,
            'contract'::character varying,
            'internship'::character varying
          ]
        )::text[]
      )
    )
  ),
  CONSTRAINT job_postings_experience_level_check CHECK (
    (
      (experience_level)::text = ANY (
        (
          ARRAY[
            'entry-level'::character varying,
            'mid-level'::character varying,
            'senior-level'::character varying,
            'executive'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes for job_postings
CREATE INDEX IF NOT EXISTS idx_job_postings_company_id ON public.job_postings USING btree (company_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_postings_created_by ON public.job_postings USING btree (created_by) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_postings_department ON public.job_postings USING btree (department) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON public.job_postings USING btree (created_at) TABLESPACE pg_default;

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_job_postings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS job_postings_updated_at_trigger ON job_postings;
CREATE TRIGGER job_postings_updated_at_trigger 
BEFORE UPDATE ON job_postings 
FOR EACH ROW
EXECUTE FUNCTION update_job_postings_updated_at();

