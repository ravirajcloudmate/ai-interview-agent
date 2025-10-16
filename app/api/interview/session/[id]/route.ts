import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;

  try {
    console.log('📋 Fetching session:', sessionId);

    // Try to get from interview_sessions table with related data
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        job_postings(job_title, department, id),
        interview_invitations(candidate_name, candidate_email, job_id)
      `)
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    // If session found, return it with enhanced data
    if (session) {
      console.log('✅ Session found:', session);
      
      return NextResponse.json({
        sessionId: session.id,
        roomId: session.room_id,
        jobTitle: session.job_title || session.job_postings?.job_title || 'Interview Position',
        jobId: session.job_id || session.job_postings?.id,
        agentId: session.agent_id,
        agentPrompt: session.agent_prompt || 'Conduct a professional interview',
        candidateName: session.candidate_name || session.interview_invitations?.candidate_name || 'Candidate',
        candidateEmail: session.candidate_email || session.interview_invitations?.candidate_email || '',
        status: session.status || 'waiting',
        videoEnabled: session.video_enabled !== false,
        audioEnabled: session.audio_enabled !== false,
        companyId: session.company_id,
        sessionToken: session.session_token,
        createdAt: session.created_at,
        startedAt: session.started_at,
        endedAt: session.ended_at
      });
    }

    // Fallback: session not in DB, return basic info
    console.warn('⚠️ Session not found in DB, using fallback');
    return NextResponse.json({
      sessionId: sessionId,
      roomId: `room_${Date.now()}`,
      jobTitle: 'Interview Position',
      jobId: null,
      agentPrompt: 'Conduct a professional interview',
      candidateName: 'Candidate',
      candidateEmail: '',
      status: 'waiting',
      videoEnabled: true,
      audioEnabled: true,
      companyId: null,
      sessionToken: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null
    });

  } catch (error: any) {
    console.error('❌ Error fetching session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
