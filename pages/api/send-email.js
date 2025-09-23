import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, name, couponCode, offerName, bookingUrl } = req.body;

  if (!to || !name || !couponCode) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Debug environment variables
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
    });

    // Create transporter using your SMTP credentials
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Free Coupon from Byrd's Garage</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff8c00, #ff4500); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .coupon-box { background: white; border: 3px dashed #ff8c00; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
          .coupon-code { font-size: 32px; font-weight: bold; color: #ff8c00; font-family: monospace; letter-spacing: 2px; }
          .cta-button { display: inline-block; background: #ff8c00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your Free Coupon is Here!</h1>
            <p>Thank you for choosing Byrd's Garage</p>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for requesting your free vehicle inspection! We're excited to help you keep your vehicle running smoothly.</p>
            
            <div class="coupon-box">
              <h3>Your Exclusive Coupon Code</h3>
              <div class="coupon-code">${couponCode}</div>
              <p><strong>${offerName}</strong></p>
              <p>This coupon code will be automatically applied when you book your appointment.</p>
            </div>

            <div style="text-align: center;">
              <a href="${bookingUrl}" class="cta-button">Book Your Free Inspection Now</a>
            </div>

            <h3>What to Expect:</h3>
            <ul>
              <li>✅ 90-point digital inspection with photos</li>
              <li>✅ Clear vehicle health score</li>
              <li>✅ Honest advice with no pressure</li>
              <li>✅ Professional ASE-certified technicians</li>
            </ul>

            <p><strong>Questions?</strong> Call us at (916) 991-1079 or reply to this email.</p>
          </div>
          <div class="footer">
            <p>Byrd's Garage<br>
            1234 Main Street, Elverta, CA 95626<br>
            (916) 991-1079</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Byrd's Garage" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `🎉 Your Free Coupon Code: ${couponCode}`,
      html: htmlContent,
    });

    console.log('Email sent:', info.messageId);
    res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
