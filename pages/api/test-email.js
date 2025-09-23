import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to } = req.body;

  if (!to) {
    return res.status(400).json({ message: 'Email address required' });
  }

  try {
    // Debug environment variables
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
    });

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Send test email
    const info = await transporter.sendMail({
      from: `"Byrd's Garage Test" <${process.env.SMTP_USER}>`,
      to: to,
      subject: 'Test Email from Byrd\'s Garage',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p>If you receive this, your email setup is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });

    console.log('Test email sent:', info.messageId);
    res.status(200).json({ 
      message: 'Test email sent successfully', 
      messageId: info.messageId,
      config: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
        pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
      }
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message,
      config: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
        pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
      }
    });
  }
}
