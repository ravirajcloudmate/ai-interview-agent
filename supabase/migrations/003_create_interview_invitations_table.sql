-- Migration: Create interview_invitations table
-- Description: Interview invitations table banata hai
-- `job_id` se job_postings table connect hota hai
-- Candidate details, interview link, token, status store hoti hai
-- `ai_template_id` field se prompt_templates table connect hota hai (UUID reference)
-- 
-- WORKFLOW:
-- 1. Pehle prompt_templates (agent) create karein
-- 2. Job posting create karte waqt ai_interview_template assign karein
-- 3. Interview invitation create karte waqt sirf job_id dein, trigger automatically:
--    - ai_template_id ko job_postings.ai_interview_template se populate karega
--    - interview_mode, interview_language, interview_duration, etc. bhi copy karega
-- 4. Jab invitation link open hoga, ye sab details agent ko send hongi
-- 5. Agent in details ke base par candidate ka interview lega

-- Create interview_invitations table
CREATE TABLE IF NOT EXISTS public.interview_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  company_branding_id uuid NULL,
  job_id uuid NULL,
  created_by uuid NOT NULL,
  candidate_email character varying(255) NOT NULL,
  candidate_name character varying(255) NULL,
  summary text NULL,
  interview_link character varying(500) NOT NULL,
  interview_token character varying(100) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  ai_template_id uuid NULL,
  interview_mode character varying(50) NULL DEFAULT 'video'::character varying,
  interview_language character varying(10) NULL DEFAULT 'en'::character varying,
  interview_duration integer NULL DEFAULT 30,
  questions_count integer NULL DEFAULT 5,
  difficulty_level character varying(20) NULL DEFAULT 'medium'::character varying,
  status character varying(20) NULL DEFAULT 'sent'::character varying,
  invitation_sent_at timestamp with time zone NULL DEFAULT now(),
  link_opened_at timestamp with time zone NULL,
  interview_started_at timestamp with time zone NULL,
  interview_completed_at timestamp with time zone NULL,
  interview_id uuid NULL,
  candidate_id uuid NULL,
  email_delivery_status character varying(20) NULL DEFAULT 'pending'::character varying,
  reminder_sent_count integer NULL DEFAULT 0,
  last_reminder_sent_at timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  candidate_skills text NULL,
  experience text NULL,
  interview_date date NULL,
  interview_time text NULL,
  candidate_projects text NULL,
  CONSTRAINT interview_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT interview_invitations_interview_link_key UNIQUE (interview_link),
  CONSTRAINT interview_invitations_interview_token_key UNIQUE (interview_token),
  CONSTRAINT interview_invitations_job_id_fkey FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  CONSTRAINT interview_invitations_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT interview_invitations_company_branding_id_fkey FOREIGN KEY (company_branding_id) REFERENCES company_branding(id) ON DELETE SET NULL,
  CONSTRAINT interview_invitations_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT interview_invitations_ai_template_id_fkey FOREIGN KEY (ai_template_id) REFERENCES prompt_templates(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT interview_invitations_status_check CHECK (
    (
      (status)::text = ANY (
        (
          ARRAY[
            'sent'::character varying,
            'opened'::character varying,
            'started'::character varying,
            'completed'::character varying,
            'expired'::character varying,
            'cancelled'::character varying
          ]
        )::text[]
      )
    )
  ),
  CONSTRAINT interview_invitations_email_delivery_status_check CHECK (
    (
      (email_delivery_status)::text = ANY (
        (
          ARRAY[
            'pending'::character varying,
            'sent'::character varying,
            'delivered'::character varying,
            'failed'::character varying
          ]
        )::text[]
      )
    )
  ),
  CONSTRAINT interview_invitations_interview_mode_check CHECK (
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
  )
) TABLESPACE pg_default;

-- Add ai_template_id column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interview_invitations' AND column_name = 'ai_template_id'
    ) THEN
        ALTER TABLE public.interview_invitations 
        ADD COLUMN ai_template_id uuid NULL;
        
        -- Add foreign key constraint if column was added and constraint doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'interview_invitations_ai_template_id_fkey'
        ) THEN
            ALTER TABLE public.interview_invitations
            ADD CONSTRAINT interview_invitations_ai_template_id_fkey 
            FOREIGN KEY (ai_template_id) REFERENCES prompt_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Create indexes for interview_invitations
CREATE INDEX IF NOT EXISTS idx_interview_invitations_company_id ON public.interview_invitations USING btree (company_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_interview_invitations_company_branding_id ON public.interview_invitations USING btree (company_branding_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_job_id ON public.interview_invitations USING btree (job_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_created_by ON public.interview_invitations USING btree (created_by) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_candidate_email ON public.interview_invitations USING btree (candidate_email) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_status ON public.interview_invitations USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_token ON public.interview_invitations USING btree (interview_token) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_expires_at ON public.interview_invitations USING btree (expires_at) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_email ON public.interview_invitations USING btree (candidate_email) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_invitations_ai_template_id ON public.interview_invitations USING btree (ai_template_id) TABLESPACE pg_default;

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_interview_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS interview_invitations_updated_at_trigger ON interview_invitations;
CREATE TRIGGER interview_invitations_updated_at_trigger 
BEFORE UPDATE ON interview_invitations 
FOR EACH ROW
EXECUTE FUNCTION update_interview_invitations_updated_at();

-- Function to automatically populate ai_template_id and interview settings from job_postings
-- WORKFLOW: Jab invitation create karte waqt sirf job_id dein, ye function automatically:
-- 1. ai_template_id ko job_postings.ai_interview_template se populate karega
-- 2. interview_mode, interview_language, interview_duration, questions_count, difficulty_level copy karega
CREATE OR REPLACE FUNCTION auto_populate_invitation_from_job()
RETURNS TRIGGER AS $$
DECLARE
    job_record RECORD;
BEGIN
    -- Agar job_id diya hai to us job posting se details fetch karo
    IF NEW.job_id IS NOT NULL THEN
        SELECT 
            ai_interview_template,
            interview_mode,
            interview_language,
            interview_duration,
            questions_count,
            difficulty_level
        INTO job_record
        FROM job_postings
        WHERE id = NEW.job_id;
        
        -- Agar template ID missing hai to job posting se copy karo
        IF NEW.ai_template_id IS NULL AND job_record.ai_interview_template IS NOT NULL THEN
            NEW.ai_template_id := job_record.ai_interview_template;
        END IF;
        
        -- Interview settings copy karo agar explicitly set nahi kiye gaye
        IF NEW.interview_mode IS NULL OR NEW.interview_mode = 'video' THEN
            NEW.interview_mode := COALESCE(job_record.interview_mode, 'video');
        END IF;
        
        IF NEW.interview_language IS NULL OR NEW.interview_language = 'en' THEN
            NEW.interview_language := COALESCE(job_record.interview_language, 'en');
        END IF;
        
        IF NEW.interview_duration IS NULL OR NEW.interview_duration = 30 THEN
            NEW.interview_duration := COALESCE(job_record.interview_duration, 30);
        END IF;
        
        IF NEW.questions_count IS NULL OR NEW.questions_count = 5 THEN
            NEW.questions_count := COALESCE(job_record.questions_count, 5);
        END IF;
        
        IF NEW.difficulty_level IS NULL OR NEW.difficulty_level = 'medium' THEN
            NEW.difficulty_level := COALESCE(job_record.difficulty_level, 'medium');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate invitation details from job_postings
DROP TRIGGER IF EXISTS auto_populate_invitation_from_job_trigger ON interview_invitations;
CREATE TRIGGER auto_populate_invitation_from_job_trigger
BEFORE INSERT OR UPDATE ON interview_invitations
FOR EACH ROW
EXECUTE FUNCTION auto_populate_invitation_from_job();
