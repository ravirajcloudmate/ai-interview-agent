import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

/**
 * Generate LiveKit token for candidate
 * This proxies to the Python backend which has the agent dispatch logic
 */
export async function POST(req: NextRequest) {
  try {
    const { room, identity, metadata } = await req.json();
    
    if (!room || !identity) {
      return NextResponse.json({ 
        error: 'room and identity are required' 
      }, { status: 400 });
    }

    console.log('🎫 Requesting token from backend:', { room, identity });

    try {
      // Get token from Python backend (includes agent dispatch)
      const backendResponse = await fetch(`${BACKEND_URL}/token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room,
          identity,
          metadata: metadata || 'interview'
        })
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.detail || 'Failed to generate token');
      }

      const tokenData = await backendResponse.json();
      console.log('✅ Token generated:', { room, identity });

      return NextResponse.json({
        url: tokenData.url,
        token: tokenData.token,
        identity: tokenData.identity,
        room: tokenData.room
      });

    } catch (error: any) {
      console.error('❌ Backend token generation failed:', error);
      return NextResponse.json({
        error: error.message || 'Failed to generate token from backend',
        details: 'Make sure Python backend is running on http://localhost:8001'
      }, { status: 500 });
    }

  } catch (e: any) {
    console.error('Token generation error:', e);
    return NextResponse.json({ 
      error: e?.message || 'Failed to generate token' 
    }, { status: 500 });
  }
}