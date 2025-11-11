import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { id } = await context.params;
    console.log('📡 Fetching session details for ID:', id);

    // First try to get from interview_sessions table
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        interview_invitations!inner(
          candidate_name,
          candidate_email,
          job_id,
          agent_prompt
        )
      `)
      .eq('id', id)
      .single();

    if (sessionData && !sessionError) {
      const sd: any = sessionData as any;
      console.log('✅ Found session in interview_sessions table');
      return NextResponse.json({
        session: {
          id: sd.id,
          room_id: sd.room_id,
          candidate_name: sd.candidate_name || sd.interview_invitations?.candidate_name,
          candidate_email: sd.candidate_email || sd.interview_invitations?.candidate_email,
          job_id: sd.job_id || sd.interview_invitations?.job_id,
          agent_prompt: sd.agent_prompt || sd.interview_invitations?.agent_prompt,
          status: sd.status,
          created_at: sd.created_at
        }
      });
    }

    // Fallback: try to get from interview_invitations table
    console.log('⚠️ Session not found in interview_sessions, trying interview_invitations...');
    
    const { data: invitationData, error: invitationError } = await supabase
      .from('interview_invitations')
      .select('*')
      .eq('id', id)
      .single();

    if (invitationData && !invitationError) {
      const inv: any = invitationData as any;
      console.log('✅ Found invitation in interview_invitations table');
      
      // Generate a room_id if not present
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        session: {
          id: inv.id,
          room_id: roomId,
          candidate_name: inv.candidate_name,
          candidate_email: inv.candidate_email,
          job_id: inv.job_id,
          agent_prompt: 'Conduct a professional interview for the position.',
          status: 'waiting',
          created_at: inv.created_at
        }
      });
    }

    console.error('❌ Session not found in either table');
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('❌ Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
