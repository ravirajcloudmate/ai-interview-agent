-- Migration: Add assessment column to prompt_templates table
-- Description: Adds assessment field to store assessment criteria and evaluation methods

-- Add assessment column if it doesn't exist
ALTER TABLE prompt_templates 
ADD COLUMN IF NOT EXISTS assessment TEXT;

-- Add comment
COMMENT ON COLUMN prompt_templates.assessment IS 'Assessment criteria and evaluation methods for the interview';

