import { NextRequest, NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get('room');
    const candidateId = searchParams.get('candidateId');

    if (!roomName && !candidateId) {
      return NextResponse.json({ 
        error: 'room or candidateId parameter is required' 
      }, { status: 400 });
    }

    const serverUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!serverUrl || !apiKey || !apiSecret) {
      return NextResponse.json({ 
        error: 'LiveKit environment variables not configured' 
      }, { status: 500 });
    }

    // Get status from Python backend first (primary source)
    if (candidateId) {
      try {
        const backendResponse = await fetch(
          `${BACKEND_URL}/interview-status/${candidateId}`,
          { cache: 'no-store' }
        );
        
        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          console.log('✅ Backend status:', backendData);
          
          if (backendData.status === 'active') {
            // Get LiveKit room details
            const roomService = new RoomServiceClient(serverUrl, apiKey, apiSecret);
            const effectiveRoomName = backendData.roomName || roomName || `interview-${candidateId}`;
            
            try {
              const participants = await roomService.listParticipants(effectiveRoomName);
              
              const agentConnected = participants.some(p => 
                p.identity?.includes('agent')
              );
              
              const candidateConnected = participants.some(p => 
                p.identity?.includes('candidate')
              );

              return NextResponse.json({
                status: 'success',
                roomName: effectiveRoomName,
                agentConnected,
                candidateConnected,
                participantCount: participants.length,
                currentQuestion: null,
                interviewProgress: 0,
                participants: participants.map(p => ({
                  identity: p.identity,
                  name: p.name || 'Unknown',
                  isAgent: p.identity?.includes('agent') || false,
                  isCandidate: p.identity?.includes('candidate') || false,
                  joinedAt: p.joinedAt ? new Date(Number(p.joinedAt) / 1000000).toISOString() : null
                }))
              });
            } catch (roomError) {
              console.log('Room not yet created or error:', roomError);
              // Room doesn't exist yet, that's okay
              return NextResponse.json({
                status: 'success',
                roomName: effectiveRoomName,
                agentConnected: false,
                candidateConnected: false,
                participantCount: 0,
                message: 'Room not yet created, will be created when candidate joins'
              });
            }
          } else {
            return NextResponse.json({
              status: 'not_found',
              message: 'No active interview found for this candidate'
            });
          }
        }
      } catch (error) {
        console.log('⚠️ Backend status check failed:', error);
      }
    }

    // Fallback: Check LiveKit directly
    const roomService = new RoomServiceClient(serverUrl, apiKey, apiSecret);
    const effectiveRoomName = roomName || `interview-${candidateId}`;
    
    try {
      const participants = await roomService.listParticipants(effectiveRoomName);
      
      const agentConnected = participants.some(p => 
        p.identity?.includes('agent')
      );
      
      const candidateConnected = participants.some(p => 
        p.identity?.includes('candidate')
      );

      return NextResponse.json({
        status: 'success',
        roomName: effectiveRoomName,
        agentConnected,
        candidateConnected,
        participantCount: participants.length,
        participants: participants.map(p => ({
          identity: p.identity,
          name: p.name || 'Unknown',
          isAgent: p.identity?.includes('agent') || false,
          isCandidate: p.identity?.includes('candidate') || false,
          joinedAt: p.joinedAt ? new Date(Number(p.joinedAt) / 1000000).toISOString() : null
        }))
      });

    } catch (error: any) {
      console.error('Error getting room status:', error);
      return NextResponse.json({ 
        status: 'room_not_found',
        error: error.message,
        agentConnected: false,
        candidateConnected: false
      });
    }

  } catch (e: any) {
    console.error('Agent status error:', e);
    return NextResponse.json({ 
      status: 'error',
      error: e?.message || 'Failed to get agent status' 
    }, { status: 500 });
  }
}