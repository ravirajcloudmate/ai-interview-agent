import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, candidateName, interviewLink, jobTitle, companyName } = await request.json();

    // Validate required fields
    if (!email || !interviewLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const smtpHost =
      process.env.SMTP_HOST ||
      process.env.EMAIL_HOST ||
      (process.env.GMAIL_USER ? 'smtp.gmail.com' : undefined);
    const smtpUser =
      process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
    const smtpPass =
      process.env.SMTP_PASS ||
      process.env.SMTP_PASSWORD ||
      process.env.EMAIL_PASS ||
      process.env.EMAIL_PASSWORD ||
      process.env.GMAIL_PASS;
    const smtpPort = parseInt(
      process.env.SMTP_PORT || process.env.EMAIL_PORT || '587',
      10
    );
    const smtpSecure =
      process.env.SMTP_SECURE === 'true' ||
      process.env.EMAIL_SECURE === 'true' ||
      smtpPort === 465;
    const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS;

    if ((!smtpHost || !smtpUser || !smtpPass) && (!gmailUser || !gmailPass)) {
      return NextResponse.json(
        { error: 'Email configuration is incomplete. Please set SMTP or Gmail credentials.' },
        { status: 500 }
      );
    }

    // Create email transporter (configure with your SMTP settings)
    const transporter = nodemailer.createTransport(
      smtpHost && smtpUser && smtpPass
        ? {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          }
        : {
            service: 'gmail',
            auth: {
              user: gmailUser,
              pass: gmailPass
            }
          }
    );

    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error('❌ Email transporter verification failed:', verifyError);
      return NextResponse.json(
        {
          error: 'Failed to verify email transporter configuration',
          details: verifyError?.message || verifyError,
          config: {
            smtpHost: smtpHost ? 'provided' : 'missing',
            smtpUser: smtpUser ? 'provided' : 'missing',
            gmailConfigured: !!(gmailUser && gmailPass),
            port: smtpPort,
            secure: smtpSecure
          }
        },
        { status: 500 }
      );
    }

    // Email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #e30d0d; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #e30d0d; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI Interview Invitation</h1>
    </div>
    <div class="content">
      <h2>Hello ${candidateName || 'Candidate'}!</h2>
      <p>You've been invited to participate in an AI-powered interview for the position of <strong>${jobTitle || 'Position'}</strong> at <strong>${companyName || 'our company'}</strong>.</p>
      
      <p>This is a modern, AI-assisted interview experience where you'll interact with our AI interviewer. The process is:</p>
      <ul>
        <li>Professional and conversational</li>
        <li>Flexible and candidate-friendly</li>
        <li>Designed to showcase your skills effectively</li>
      </ul>

      <p>Click the button below to start your interview:</p>
      <a href="${interviewLink}" class="button">Start Interview</a>
      
      <p>Or copy this link: <br><code>${interviewLink}</code></p>

      <p><strong>Important notes:</strong></p>
      <ul>
        <li>Ensure you have a stable internet connection</li>
        <li>Use a device with camera and microphone</li>
        <li>Find a quiet, well-lit location</li>
        <li>Allow browser permissions for camera/microphone</li>
      </ul>

      <p>We look forward to learning more about you!</p>
      
      <p>Best regards,<br>${companyName || 'The Team'}</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    try {
      await transporter.sendMail({
        from: `"${companyName || 'AI Interview'}" <${process.env.SMTP_FROM || smtpUser || gmailUser}>`,
        to: email,
        subject: `Interview Invitation - ${jobTitle || 'Position'}`,
        html: emailHtml
      });
    } catch (sendError: any) {
      console.error('❌ Email sending error:', sendError);
      return NextResponse.json(
        {
          error: sendError?.message || 'Failed to send invitation',
          response: sendError?.response,
          code: sendError?.code,
          command: sendError?.command
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview invitation sent successfully'
    });

  } catch (error: any) {
    console.error('❌ Email route unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
