import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const livekitHost = process.env.LIVEKIT_URL || 'ws://localhost:7880';
const apiKey = process.env.LIVEKIT_API_KEY!;
const apiSecret = process.env.LIVEKIT_API_SECRET!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  const roomName = searchParams.get('roomName');
  const username = searchParams.get('username');

  // Handle direct room access (new format)
  if (roomName && username) {
    console.log('🎫 Generating token for direct room access:', { roomName, username });
    
    const participantName = username;

    // Generate access token for participant
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    console.log('✅ Direct room token generated successfully');
    console.log('  Room:', roomName);
    console.log('  Participant:', participantName);

    return NextResponse.json({
      token,
      roomName,
      participantName,
    });
  }

  // Handle session-based access (existing format)
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID or roomName required' }, { status: 400 });
  }

  try {
    console.log('🎫 Generating token for session:', sessionId);

    // Fetch session details
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const sessionRes = await fetch(`${baseUrl}/api/sessions/${sessionId}`);
    
    if (!sessionRes.ok) {
      throw new Error('Failed to fetch session details');
    }

    const { session } = await sessionRes.json();
    console.log('✅ Session fetched:', session.room_id);

    const roomName: string = session.room_id;
    const participantName: string = session.candidate_name || 'Candidate';

    // Prepare room metadata
    const roomMetadata = {
      sessionId: sessionId,
      agentPrompt: session.agent_prompt || 'You are a professional AI interviewer.',
      jobDetails: {
        jobId: session.job_id,
        candidateEmail: session.candidate_email,
        candidateName: session.candidate_name,
      }
    };

    console.log('📝 Room metadata:', roomMetadata);

    // Create or update room with metadata
    const roomService = new RoomServiceClient(
      livekitHost.replace('ws://', 'http://').replace('wss://', 'https://'),
      apiKey,
      apiSecret
    );
console.log(roomService,'here is the room service');
    try {
      // Try to create room with metadata
      await roomService.createRoom({
        name: roomName,
        metadata: JSON.stringify(roomMetadata),
        emptyTimeout: 300, // 5 minutes
        maxParticipants: 10,
      });
      console.log('✅ Room created with metadata' ,roomService);
    } catch (err: any) {
      // Room might already exist, update metadata
      if (err.message?.includes('already exists')) {
        await roomService.updateRoomMetadata(roomName, JSON.stringify(roomMetadata));
        console.log('✅ Room metadata updated');
      } else {
        console.warn('⚠️ Room creation warning:', err.message);
      }
    }

    // Generate access token for participant
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    console.log('✅ Token generated successfully');
    console.log('  Room:', roomName);
    console.log('  Participant:', participantName);

    return NextResponse.json({
      token,
      roomName,
      sessionId,
      participantName,
    });

  } catch (error: any) {
    console.error('❌ Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token', details: error.message },
      { status: 500 }
    );
  }
}