import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { invitationId?: string } }
) {
  const invitationId = params.invitationId;

  if (!invitationId) {
    return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();

    // Delete dependant records first to satisfy foreign key constraints
    const deleteSessions = await supabaseAdmin
      .from('interview_sessions')
      .delete()
      .eq('invitation_id', invitationId);

    if (deleteSessions.error) {
      console.error('Failed to delete interview sessions:', deleteSessions.error);
      throw deleteSessions.error;
    }

    const deleteSummaries = await supabaseAdmin
      .from('candidate_summaries')
      .delete()
      .eq('invitation_id', invitationId);

    if (deleteSummaries.error) {
      console.error('Failed to delete candidate summaries:', deleteSummaries.error);
      throw deleteSummaries.error;
    }

    const deleteInvitation = await supabaseAdmin
      .from('interview_invitations')
      .delete()
      .eq('id', invitationId)
      .single();

    if (deleteInvitation.error) {
      console.error('Failed to delete interview invitation:', deleteInvitation.error);
      throw deleteInvitation.error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting interview invitation:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete invitation',
        details: error?.message || error
      },
      { status: 500 }
    );
  }
}

