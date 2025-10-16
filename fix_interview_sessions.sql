-- Fix for interview_sessions table - Run this in Supabase SQL Editor

-- 1. Create the interview_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES interview_invitations(id),
  job_id UUID REFERENCES job_postings(id),
  agent_id TEXT NOT NULL, -- AI Agent template ID
  agent_prompt TEXT NOT NULL, -- Agent's interview prompt
  candidate_email TEXT NOT NULL,
  candidate_name TEXT,
  
  -- Session details
  session_token TEXT UNIQUE NOT NULL, -- For WebRTC room
  room_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting', -- waiting, active, completed, cancelled
  
  -- Interview data
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Media settings
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  
  -- Results
  transcript TEXT,
  ai_analysis JSONB,
  candidate_responses JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the interview_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL, -- 'agent', 'candidate', or 'system'
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_token ON interview_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_room_id ON interview_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_candidate_email ON interview_sessions(candidate_email);
CREATE INDEX IF NOT EXISTS idx_interview_messages_session_id ON interview_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_messages_timestamp ON interview_messages(timestamp);

-- 4. Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_messages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DROP POLICY IF EXISTS "Allow reading session by token" ON interview_sessions;
CREATE POLICY "Allow reading session by token" ON interview_sessions
  FOR SELECT USING (true); -- Public access for interview links

DROP POLICY IF EXISTS "Allow inserting sessions" ON interview_sessions;
CREATE POLICY "Allow inserting sessions" ON interview_sessions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updating session status" ON interview_sessions;
CREATE POLICY "Allow updating session status" ON interview_sessions
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow inserting messages" ON interview_messages;
CREATE POLICY "Allow inserting messages" ON interview_messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading session messages" ON interview_messages;
CREATE POLICY "Allow reading session messages" ON interview_messages
  FOR SELECT USING (true);

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON interview_sessions TO authenticated;
GRANT INSERT, SELECT ON interview_messages TO authenticated;
GRANT SELECT ON interview_sessions TO anon; -- Allow anonymous access for interview links
