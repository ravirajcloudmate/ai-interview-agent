// app/api/sessions/by-room/[roomId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    
    console.log('🔍 Looking for session with room_id:', roomId);

    // Find session by room_id
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error || !session) {
      console.error('❌ Session not found:', error);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('✅ Session found:', session.id);

    return NextResponse.json({ success: true, session });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
