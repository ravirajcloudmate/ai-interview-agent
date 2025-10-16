import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, roomId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('👤 Candidate joining session:', sessionId, 'Room:', roomId);

    // Update session status to active
    const { data: updatedSession, error: updateError } = await supabase
      .from('interview_sessions')
      .update({ 
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('❌ Error updating session status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update session status: ' + updateError.message },
        { status: 500 }
      );
    }

    if (!updatedSession) {
      console.warn('⚠️ Session not found for ID:', sessionId);
      // Continue anyway - might be using fallback
    }

    // Notify Python backend that candidate joined
    try {
      console.log('📡 Notifying Python backend...');
      const backendResponse = await fetch('http://localhost:8001/api/candidate-joined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          roomId: roomId || updatedSession?.room_id,
          candidateName: updatedSession?.candidate_name || 'Candidate',
          candidateEmail: updatedSession?.candidate_email || ''
        })
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.warn('⚠️ Failed to notify Python backend:', errorText);
      } else {
        console.log('✅ Python backend notified successfully');
      }
    } catch (backendError) {
      console.warn('⚠️ Error notifying Python backend:', backendError);
      // Don't fail the request if backend notification fails
    }

    // Add initial message to interview_messages (optional)
    if (updatedSession) {
      try {
        await supabase
          .from('interview_messages')
          .insert({
            session_id: sessionId,
            speaker: 'system',
            message: `Candidate ${updatedSession.candidate_name || 'joined'} the interview`,
            timestamp: new Date().toISOString()
          });
        console.log('✅ Interview message added');
      } catch (messageError) {
        console.warn('⚠️ Could not add interview message:', messageError);
        // Don't fail the request if message insertion fails
      }
    }

    console.log('✅ Join process completed successfully');
    return NextResponse.json({ 
      success: true,
      session: updatedSession || { id: sessionId, room_id: roomId }
    });

  } catch (error: any) {
    console.error('❌ Error in join endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join session' },
      { status: 500 }
    );
  }
}
