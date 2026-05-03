import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"EduBridge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - email failures shouldn't break the application
    return null;
  }
}

export async function sendApplicationConfirmation(email, name, applicationId, paymentAmount = null, paymentReference = null) {
  const amountDisplay = paymentAmount ? `XOF ${paymentAmount}` : 'N/A';
  const paymentInfo = paymentReference ? `
    <div class="info-row">
      <span class="info-label">Payment Ref:</span>
      <span class="info-value">${paymentReference}</span>
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px; margin-top: 0; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 6px; margin: 24px 0; }
        .info-row { display: block; margin-bottom: 8px; font-size: 15px; }
        .info-row:last-child { margin-bottom: 0; }
        .info-label { color: #64748b; font-weight: 600; display: inline-block; width: 130px; }
        .info-value { color: #0f172a; font-weight: 700; }
        .message { color: #475569; font-size: 16px; margin-bottom: 24px; }
        .signature { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #475569; }
        .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 13px; padding: 0 20px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Application Received! 🎉</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${name},</p>
            <p class="message">Your application has been received successfully. Our team is currently reviewing your documents and will get back to you shortly.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Application ID:</span>
                <span class="info-value">${applicationId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount Paid:</span>
                <span class="info-value">${amountDisplay}</span>
              </div>
              ${paymentInfo}
            </div>

            <p class="message">You will receive updates regarding your application status directly at this email address.</p>
            
            <div class="signature">
              <p style="margin: 0;">Best regards,</p>
              <p style="margin: 4px 0 0 0; font-weight: 600; color: #111827;">EduBridge Team</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Application Confirmation - EduBridge',
    html,
  });
}

export async function sendStatusUpdateEmail(email, name, status, applicationId) {
  const statusMessages = {
    under_review: 'Your application is now being actively reviewed by our admissions team.',
    approved: 'Congratulations! Your application has been approved. We will contact you shortly with your next steps.',
    rejected: 'After careful consideration, we regret to inform you that your application has not been approved at this time. Please contact our support team if you have any questions.',
  };

  // Upgraded modern color palette
  const statusColors = {
    under_review: '#3b82f6', // Modern Blue
    approved: '#10b981',     // Modern Green
    rejected: '#ef4444',     // Modern Red
  };

  // Softer background colors for the badge
  const statusBgColors = {
    under_review: '#eff6ff',
    approved: '#ecfdf5',
    rejected: '#fef2f2',
  };

  const activeColor = statusColors[status] || '#4f46e5';
  const activeBgColor = statusBgColors[status] || '#e0e7ff';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; border-top: 6px solid ${activeColor}; }
        .content { padding: 40px 30px; }
        .header-title { text-align: center; color: #111827; margin-top: 0; margin-bottom: 24px; font-size: 22px; font-weight: 700; }
        .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px; margin-top: 0; }
        .status-container { text-align: center; margin: 32px 0; padding: 24px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .status-badge { display: inline-block; background: ${activeBgColor}; color: ${activeColor}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; border: 1px solid ${activeColor}40; margin-bottom: 16px; }
        .status-message { font-size: 16px; color: #374151; margin: 0; }
        .app-id-text { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 8px; }
        .signature { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #475569; }
        .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 13px; padding: 0 20px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="content">
            <h1 class="header-title">Application Status Update</h1>
            <p class="greeting">Dear ${name},</p>
            <p style="color: #475569;">There has been an update to your EduBrigde application.</p>
            
            <div class="status-container">
              <div class="app-id-text">Application ID: <strong>${applicationId}</strong></div>
              <span class="status-badge">${status.replace('_', ' ').toUpperCase()}</span>
              <p class="status-message">${statusMessages[status] || ''}</p>
            </div>
            
            <div class="signature">
              <p style="margin: 0;">Best regards,</p>
              <p style="margin: 4px 0 0 0; font-weight: 600; color: #111827;">EduBrigde Team</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Application Status Update - ${status.replace('_', ' ').toUpperCase()}`,
    html,
  });
}