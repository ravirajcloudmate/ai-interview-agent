import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export async function POST(req: NextRequest) {
  try {
    const { roomName, candidateId, jobId, candidateName, roleType } = await req.json();
    
    if (!candidateId) {
      return NextResponse.json({ 
        error: 'candidateId is required' 
      }, { status: 400 });
    }

    console.log('🎬 Starting interview for candidate:', candidateId);

    // Generate unique room name if not provided
    const finalRoomName = roomName || `interview-candidate-${candidateId}-${Date.now()}`;

    try {
      // Call Python backend to start interview
      const backendResponse = await fetch(`${BACKEND_URL}/start-interview`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: finalRoomName,
          candidateId,
          jobId: jobId || 'default-job',
          candidateName: candidateName || 'Candidate',
          roleType: roleType || 'general'
        })
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.detail || 'Backend failed to start interview');
      }

      const backendData = await backendResponse.json();
      console.log('✅ Backend response:', backendData);

      if (backendData.success) {
        return NextResponse.json({ 
          success: true,
          roomName: backendData.roomName,
          token: backendData.token,
          url: backendData.url,
          candidateId: backendData.candidateId,
          jobId: backendData.jobId,
          agentName: backendData.agentName,
          message: 'Interview started successfully. AI agent will join when you connect.'
        });
      } else {
        throw new Error(backendData.message || 'Failed to start interview');
      }

    } catch (error: any) {
      console.error('❌ Backend connection failed:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to connect to interview backend',
        details: 'Make sure Python backend is running on http://localhost:8001'
      }, { status: 500 });
    }

  } catch (e: any) {
    console.error('Start interview error:', e);
    return NextResponse.json({ 
      success: false,
      error: e?.message || 'Failed to start interview' 
    }, { status: 500 });
  }
}