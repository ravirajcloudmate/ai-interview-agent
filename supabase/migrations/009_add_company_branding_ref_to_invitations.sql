-- 009_add_company_branding_ref_to_invitations.sql
-- Ensure company_branding table exists and link interview_invitations to it

-- Create company_branding table if it does not exist
CREATE TABLE IF NOT EXISTS public.company_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  company_name text,
  industry text,
  logo_url text,
  welcome_message text,
  primary_color text,
  secondary_color text,
  background_color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Ensure the branding columns exist (for older databases)
ALTER TABLE public.company_branding
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS welcome_message text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text,
  ADD COLUMN IF NOT EXISTS background_color text,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add company_branding_id to interview_invitations if missing
ALTER TABLE public.interview_invitations
  ADD COLUMN IF NOT EXISTS company_branding_id uuid;

-- Create foreign key constraint if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'interview_invitations_company_branding_id_fkey'
      AND table_name = 'interview_invitations'
  ) THEN
    ALTER TABLE public.interview_invitations
      ADD CONSTRAINT interview_invitations_company_branding_id_fkey
      FOREIGN KEY (company_branding_id)
      REFERENCES public.company_branding(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Backfill company_branding_id based on existing company_id links
UPDATE public.interview_invitations i
SET company_branding_id = cb.id
FROM public.company_branding cb
WHERE cb.company_id = i.company_id
  AND i.company_branding_id IS NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_interview_invitations_company_branding_id
  ON public.interview_invitations(company_branding_id);

