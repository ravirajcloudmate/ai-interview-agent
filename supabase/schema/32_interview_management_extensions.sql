-- Interview Management extensions: new invite fields + candidate summaries table
-- Safe, additive migration. Re-runnable.

-- 1) Extend interview_invitations with new optional fields from the UI
ALTER TABLE IF EXISTS interview_invitations
  ADD COLUMN IF NOT EXISTS candidate_skills TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS interview_date DATE,
  ADD COLUMN IF NOT EXISTS interview_time TEXT,
  ADD COLUMN IF NOT EXISTS candidate_projects TEXT;

-- Helpful index for filtering/searching by email
CREATE INDEX IF NOT EXISTS idx_interview_invitations_email ON interview_invitations(candidate_email);

-- 2) Create candidate_summaries table to store generated summaries
CREATE TABLE IF NOT EXISTS candidate_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  invitation_id UUID REFERENCES interview_invitations(id) ON DELETE SET NULL,
  candidate_name TEXT,
  candidate_email TEXT,
  job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  skills TEXT,
  experience TEXT,
  projects TEXT,
  interview_date DATE,
  interview_time TEXT,
  summary TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_candidate_summaries_email ON candidate_summaries(candidate_email);
CREATE INDEX IF NOT EXISTS idx_candidate_summaries_invitation ON candidate_summaries(invitation_id);
CREATE INDEX IF NOT EXISTS idx_candidate_summaries_job ON candidate_summaries(job_id);

-- 3) Optional RPC to delete an invitation safely (used by UI icon action)
CREATE OR REPLACE FUNCTION delete_interview_invitation(p_invitation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove summaries linked to this invitation first (soft linkage)
  DELETE FROM candidate_summaries WHERE invitation_id = p_invitation_id;
  -- Delete the invitation itself
  DELETE FROM interview_invitations WHERE id = p_invitation_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON candidate_summaries TO authenticated;
GRANT EXECUTE ON FUNCTION delete_interview_invitation TO authenticated;


