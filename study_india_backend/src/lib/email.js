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
            from: `"Study India" <${process.env.EMAIL_USER}>`,
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

export async function sendApplicationConfirmation(email, name, applicationId) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .application-id { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 18px; font-weight: bold; color: #2e7d32; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Received! 🎉</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Your application has been received successfully. We will review your documents and get back to you soon.</p>
          <div class="application-id">
            Application ID: ${applicationId}
          </div>
          <p><strong>Application Fee:</strong> ZMW 75</p>
          <p>You will receive updates about your application status via email.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Study India Team</strong></p>
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
        subject: 'Application Confirmation - Study India',
        html,
    });
}

export async function sendStatusUpdateEmail(email, name, status, applicationId) {
    const statusMessages = {
        under_review: 'Your application is now being reviewed by our team.',
        approved: 'Congratulations! Your application has been approved. We will contact you with further instructions.',
        rejected: 'Unfortunately, your application has been rejected. Please contact our support team for more information.',
    };

    const statusColors = {
        under_review: '#1976d2',
        approved: '#2e7d32',
        rejected: '#c62828',
    };

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusColors[status] || '#667eea'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; background: ${statusColors[status] || '#667eea'}; color: white; padding: 10px 20px; border-radius: 25px; font-size: 16px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Your application (ID: ${applicationId}) status has been updated.</p>
          <div style="text-align: center;">
            <span class="status-badge">${status.replace('_', ' ').toUpperCase()}</span>
          </div>
          <p>${statusMessages[status] || ''}</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Study India Team</strong></p>
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