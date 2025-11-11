-- Migration: Create prompt_templates table
-- Description: Prompt templates table banata hai
-- AI agent ke interview instructions store karta hai
-- JSONB format mein questions, feedback messages, etc. store hote hain

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  created_by uuid NULL,
  name character varying(255) NOT NULL,
  target_role character varying(255) NULL,
  description text NULL,
  assessment text NULL,
  category character varying(100) NULL DEFAULT 'technical'::character varying,
  level character varying(50) NULL DEFAULT 'mid'::character varying,
  duration_minutes integer NULL DEFAULT 45,
  position character varying(255) NULL,
  prompt_text jsonb NOT NULL DEFAULT '{"duration": 45, "encouragement": [], "error_messages": {"timeout": "I have not heard from you in a while. Are you still there?", "technical": "I am experiencing a technical issue. Please give me a moment.", "no_response": "I did not quite catch that. Could you please repeat your answer?"}, "closing_message": "", "greeting_message": "", "neutral_feedback": [], "default_questions": [], "positive_feedback": [], "technical_questions": [], "interviewer_instructions": ""}'::jsonb,
  usage_count integer NULL DEFAULT 0,
  rating numeric(3, 2) NULL DEFAULT 0.00,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT prompt_templates_pkey PRIMARY KEY (id),
  CONSTRAINT prompt_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT prompt_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Create indexes for prompt_templates
CREATE INDEX IF NOT EXISTS idx_prompt_templates_company ON public.prompt_templates USING btree (company_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON public.prompt_templates USING btree (category) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_level ON public.prompt_templates USING btree (level) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON public.prompt_templates USING btree (is_active) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_by ON public.prompt_templates USING btree (created_by) TABLESPACE pg_default;

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;
CREATE TRIGGER update_prompt_templates_updated_at 
BEFORE UPDATE ON prompt_templates 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

