-- Row Level Security Policies for prompt_templates table

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view prompt templates from their own company
CREATE POLICY "Users can view their company's prompt templates"
  ON prompt_templates
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can create prompt templates for their company
CREATE POLICY "Users can create prompt templates for their company"
  ON prompt_templates
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can update prompt templates from their company
CREATE POLICY "Users can update their company's prompt templates"
  ON prompt_templates
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete prompt templates from their company
CREATE POLICY "Users can delete their company's prompt templates"
  ON prompt_templates
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON prompt_templates TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

