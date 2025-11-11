-- Migration: Create interview_sessions table
-- Description: Interview sessions table banata hai
-- Teen important connections:
--   * `invitation_id` → interview_invitations
--   * `job_id` → job_postings
--   * `agent_id` → prompt_templates
-- Live interview data, transcript, AI analysis store hota hai

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invitation_id uuid NULL,
  job_id uuid NULL,
  agent_id uuid NULL,
  agent_prompt text NOT NULL,
  candidate_email text NOT NULL,
  candidate_name text NULL,
  session_token text NOT NULL,
  room_id text NOT NULL,
  status text NULL DEFAULT 'waiting'::text,
  started_at timestamp with time zone NULL,
  ended_at timestamp with time zone NULL,
  duration_seconds integer NULL,
  video_enabled boolean NULL DEFAULT true,
  audio_enabled boolean NULL DEFAULT true,
  transcript text NULL,
  ai_analysis jsonb NULL,
  candidate_responses jsonb NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT interview_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT interview_sessions_room_id_key UNIQUE (room_id),
  CONSTRAINT interview_sessions_session_token_key UNIQUE (session_token),
  CONSTRAINT interview_sessions_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES prompt_templates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT interview_sessions_invitation_id_fkey FOREIGN KEY (invitation_id) REFERENCES interview_invitations(id),
  CONSTRAINT interview_sessions_job_id_fkey FOREIGN KEY (job_id) REFERENCES job_postings(id)
) TABLESPACE pg_default;

-- Create indexes for interview_sessions
CREATE INDEX IF NOT EXISTS idx_interview_sessions_token ON public.interview_sessions USING btree (session_token) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_room_id ON public.interview_sessions USING btree (room_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON public.interview_sessions USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_candidate_email ON public.interview_sessions USING btree (candidate_email) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_invitation_id ON public.interview_sessions USING btree (invitation_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_job_id ON public.interview_sessions USING btree (job_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_agent_id ON public.interview_sessions USING btree (agent_id) TABLESPACE pg_default;

-- Create function for updated_at trigger (reuse existing function from prompt_templates migration)
-- Note: update_updated_at_column() should already exist from 001_create_prompt_templates_table.sql
-- If not, create it here
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS interview_sessions_updated_at_trigger ON interview_sessions;
CREATE TRIGGER interview_sessions_updated_at_trigger 
BEFORE UPDATE ON interview_sessions 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

