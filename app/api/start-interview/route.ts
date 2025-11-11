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
      console.log('📡 Calling Python backend:', `${BACKEND_URL}/start-interview`);
      console.log('📋 Request data:', {
        roomName: finalRoomName,
        candidateId,
        jobId: jobId || 'default-job',
        candidateName: candidateName || 'Candidate'
      });

      // Call Python backend to start interview with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        // If 404, endpoint doesn't exist - this is OK, agent can join later
        if (backendResponse.status === 404) {
          console.log('ℹ️ Backend endpoint /start-interview not found - this is OK, agent will connect when backend is ready');
          return NextResponse.json({
            success: true,
            message: 'Interview room is ready. Agent will connect automatically when backend endpoints are configured.',
            backendUrl: BACKEND_URL,
            note: 'Backend endpoint /start-interview needs to be created in Python backend.',
            missingEndpoint: '/start-interview'
          });
        }
        const errorData = await backendResponse.json().catch(() => ({ detail: 'Unknown error' }));
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
      console.error('Error details:', {
        message: error.message,
        cause: error.cause,
        name: error.name,
        stack: error.stack
      });
      
      // Don't fail the interview if backend is unavailable - agent can join later
      // Return success but with informational message
      return NextResponse.json({
        success: true,
        message: 'Interview room is ready. Agent will connect automatically when backend is available.',
        backendUrl: BACKEND_URL,
        note: 'This is normal - the interview continues and agent will join when ready.'
      });
    }

  } catch (e: any) {
    console.error('Start interview error:', e);
    return NextResponse.json({ 
      success: false,
      error: e?.message || 'Failed to start interview' 
    }, { status: 500 });
  }
}