import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test if environment variables are set
    const envCheck = {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      GMAIL_USER: !!process.env.GMAIL_USER,
      GMAIL_PASS: !!process.env.GMAIL_PASS,
      NODE_ENV: process.env.NODE_ENV
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment check completed'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment',
      details: error 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email, candidateName, interviewLink, jobTitle, companyName } = await request.json()
    
    // Test email sending without actual sending
    console.log('Test email sending with data:', {
      email,
      candidateName,
      interviewLink,
      jobTitle,
      companyName,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Test email data logged to console',
      data: {
        email,
        candidateName,
        interviewLink,
        jobTitle,
        companyName
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to test email',
      details: error 
    }, { status: 500 })
  }
}
