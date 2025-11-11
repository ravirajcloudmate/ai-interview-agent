-- 010_add_summary_to_interview_invitations.sql
-- Adds summary column to interview_invitations and backfills from candidate_summaries

ALTER TABLE public.interview_invitations
  ADD COLUMN IF NOT EXISTS summary TEXT;

-- Backfill from candidate_summaries where available
UPDATE public.interview_invitations inv
SET summary = cs.summary
FROM public.candidate_summaries cs
WHERE cs.invitation_id = inv.id
  AND inv.summary IS NULL;

-- Optional: add indexes manually later if required for search performance

