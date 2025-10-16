import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const emailConfig = {
      // Gmail Configuration
      GMAIL_USER: !!process.env.GMAIL_USER,
      GMAIL_PASS: !!process.env.GMAIL_PASS,
      
      // SMTP Configuration
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      SMTP_PORT: process.env.SMTP_PORT || '587',
      SMTP_SECURE: process.env.SMTP_SECURE === 'true',
      
      // Other
      NODE_ENV: process.env.NODE_ENV,
      SMTP_FROM: process.env.SMTP_FROM
    }

    // Determine which email service will be used
    let emailService = 'none';
    if (emailConfig.GMAIL_USER && emailConfig.GMAIL_PASS) {
      emailService = 'gmail';
    } else if (emailConfig.SMTP_HOST && emailConfig.SMTP_USER && emailConfig.SMTP_PASS) {
      emailService = 'smtp';
    } else {
      emailService = 'ethereal (development)';
    }

    return NextResponse.json({
      success: true,
      emailConfig,
      emailService,
      message: `Email service: ${emailService}`,
      setupRequired: emailService === 'none' && process.env.NODE_ENV === 'production'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check email configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
