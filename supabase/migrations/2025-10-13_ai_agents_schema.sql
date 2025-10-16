-- AI Agents Table Schema for Supabase
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS prompt_templates (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign Keys
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Basic Information (Form Fields 1-7)
  name VARCHAR(255) NOT NULL,
  target_role VARCHAR(255),
  description TEXT,
  assessment TEXT,
  category VARCHAR(100) DEFAULT 'technical',
  level VARCHAR(50) DEFAULT 'mid',
  duration_minutes INTEGER DEFAULT 45,
  
  -- Position field (same as target_role, kept for backwards compatibility)
  position VARCHAR(255),
  
  -- Prompt Data (Fields 8-15 stored as JSONB)
  prompt_text JSONB NOT NULL DEFAULT '{
    "interviewer_instructions": "",
    "greeting_message": "",
    "duration": 45,
    "default_questions": [],
    "technical_questions": [],
    "positive_feedback": [],
    "neutral_feedback": [],
    "encouragement": [],
    "closing_message": "",
    "error_messages": {
      "no_response": "I did not quite catch that. Could you please repeat your answer?",
      "technical": "I am experiencing a technical issue. Please give me a moment.",
      "timeout": "I have not heard from you in a while. Are you still there?"
    }
  }'::JSONB,
  
  -- Metadata
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_company ON prompt_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_level ON prompt_templates(level);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_by ON prompt_templates(created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompt_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_prompt_templates_updated_at
      BEFORE UPDATE ON prompt_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add Row Level Security (RLS)
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view templates from their company
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prompt_templates' AND policyname = 'Users can view company templates'
  ) THEN
    CREATE POLICY "Users can view company templates"
      ON prompt_templates FOR SELECT
      USING (
        company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy: Users can insert templates for their company
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prompt_templates' AND policyname = 'Users can create templates'
  ) THEN
    CREATE POLICY "Users can create templates"
      ON prompt_templates FOR INSERT
      WITH CHECK (
        company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy: Users can update templates from their company
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prompt_templates' AND policyname = 'Users can update company templates'
  ) THEN
    CREATE POLICY "Users can update company templates"
      ON prompt_templates FOR UPDATE
      USING (
        company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy: Users can delete templates from their company
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prompt_templates' AND policyname = 'Users can delete company templates'
  ) THEN
    CREATE POLICY "Users can delete company templates"
      ON prompt_templates FOR DELETE
      USING (
        company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Comments
COMMENT ON TABLE prompt_templates IS 'Stores AI interview agent configurations and prompts';
COMMENT ON COLUMN prompt_templates.name IS 'Agent Name (Field 1)';
COMMENT ON COLUMN prompt_templates.target_role IS 'Target Role (Field 2)';
COMMENT ON COLUMN prompt_templates.description IS 'Description (Field 3)';
COMMENT ON COLUMN prompt_templates.assessment IS 'Assessment criteria (Field 4)';
COMMENT ON COLUMN prompt_templates.category IS 'Category (Field 5): technical, behavioral, hr, custom';
COMMENT ON COLUMN prompt_templates.level IS 'Experience Level (Field 6): junior, mid, senior, lead';
COMMENT ON COLUMN prompt_templates.duration_minutes IS 'Duration in minutes (Field 7)';
COMMENT ON COLUMN prompt_templates.prompt_text IS 'JSONB containing fields 8-15: instructions, greeting, questions, feedback, etc.';


