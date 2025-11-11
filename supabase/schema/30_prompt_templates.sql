-- Prompt Templates Table
-- This table stores interview prompt templates that can be used for AI interviews

CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  assessment TEXT,
  prompt_text TEXT NOT NULL,
  category TEXT DEFAULT 'technical' CHECK (category IN ('technical', 'behavioral', 'hr', 'custom')),
  level TEXT DEFAULT 'mid' CHECK (level IN ('entry', 'mid', 'senior', 'lead')),
  position TEXT,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompt_templates_company_id ON prompt_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_level ON prompt_templates(level);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_position ON prompt_templates(position);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_active ON prompt_templates(is_active);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_prompt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_templates_updated_at();

-- Comments
COMMENT ON TABLE prompt_templates IS 'Stores interview prompt templates for AI agents';
COMMENT ON COLUMN prompt_templates.name IS 'Display name of the prompt template';
COMMENT ON COLUMN prompt_templates.description IS 'Brief description of what this template is for';
COMMENT ON COLUMN prompt_templates.assessment IS 'Assessment criteria and evaluation methods for the interview';
COMMENT ON COLUMN prompt_templates.prompt_text IS 'The actual prompt text content';
COMMENT ON COLUMN prompt_templates.category IS 'Category of the prompt (technical, behavioral, hr, custom)';
COMMENT ON COLUMN prompt_templates.is_active IS 'Whether this template is currently active/in use';

