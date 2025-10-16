import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export async function POST(req: NextRequest) {
  try {
    const { roomName, candidateId } = await req.json();
    
    if (!candidateId) {
      return NextResponse.json({ 
        error: 'candidateId is required' 
      }, { status: 400 });
    }

    console.log('🛑 Ending interview for candidate:', candidateId);

    try {
      // Call Python backend to end interview
      const backendResponse = await fetch(`${BACKEND_URL}/end-interview`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          candidateId
        })
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.detail || 'Failed to end interview');
      }

      const backendData = await backendResponse.json();
      console.log('✅ Interview ended:', backendData);

      return NextResponse.json({ 
        success: true,
        message: 'Interview ended successfully',
        candidateId,
        roomName: backendData.roomName
      });

    } catch (error: any) {
      console.error('❌ Backend connection failed:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to end interview'
      }, { status: 500 });
    }

  } catch (e: any) {
    console.error('End interview error:', e);
    return NextResponse.json({ 
      success: false,
      error: e?.message || 'Failed to end interview' 
    }, { status: 500 });
  }
}