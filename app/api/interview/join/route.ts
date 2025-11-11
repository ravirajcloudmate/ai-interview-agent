// app/api/start-interview/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomName, candidateId, jobId, candidateName } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    console.log('🎬 Starting interview...');
    console.log('📍 Room:', roomName);
    console.log('👤 Candidate:', candidateName || candidateId);

    // Get backend URL
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
    
    // First, check if backend is reachable
    let backendAvailable = false;
    try {
      console.log('🏥 Checking backend health...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const healthResponse = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (healthResponse.ok) {
        backendAvailable = true;
        console.log('✅ Backend is available');
      }
    } catch (healthError: any) {
      console.warn('⚠️ Backend health check failed:', healthError.message);
      console.warn('💡 Make sure Python backend is running: python server.py');
    }

    // If backend not available, return helpful error
    if (!backendAvailable) {
      return NextResponse.json({
        success: false,
        error: 'Backend server not running',
        message: 'Please start the Python backend server on port 8001',
        note: 'Run: cd backend && python server.py',
        backendUrl: BACKEND_URL
      }, { status: 503 });
    }

    // Backend is available, proceed with start-interview request
    try {
      console.log('🚀 Sending start-interview request to backend...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const backendResponse = await fetch(`${BACKEND_URL}/start-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          candidateId,
          jobId,
          candidateName,
          sessionId: body.sessionId || `session_${Date.now()}`
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text().catch(() => 'Unknown error');
        console.error('❌ Backend request failed:', backendResponse.status, errorText);
        
        return NextResponse.json({
          success: false,
          error: `Backend returned ${backendResponse.status}`,
          details: errorText
        }, { status: backendResponse.status });
      }

      const data = await backendResponse.json();
      console.log('✅ Backend response:', data);

      return NextResponse.json({
        success: true,
        message: 'Interview start request sent to backend',
        data
      });

    } catch (backendError: any) {
      console.error('❌ Backend connection failed:', backendError);
      
      // More detailed error info
      const errorDetails = {
        message: backendError.message,
        cause: backendError.cause,
        name: backendError.name,
        stack: backendError.stack
      };
      
      console.error('Error details:', errorDetails);

      return NextResponse.json({
        success: false,
        error: 'Failed to connect to backend',
        message: 'Backend server may not be running',
        note: 'Start backend with: cd backend && python server.py',
        backendUrl: BACKEND_URL,
        details: errorDetails
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('❌ Start interview error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}