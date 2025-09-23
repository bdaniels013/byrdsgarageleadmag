import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email transporter configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Coupon templates
const COUPON_TEMPLATES = {
  'BYRD-DVI90': {
    name: 'FREE 90‑Point Digital Vehicle Inspection',
    value: '$89',
    description: 'Comprehensive inspection with photos & vehicle health score',
    instructions: 'Present this code at check-in for your free digital inspection.',
    validUntil: '30 days from booking'
  },
  'BYRD-VIS15': {
    name: 'FREE 15‑Minute Visual Check',
    value: '$25',
    description: 'Quick safety check for leaks, belts, tires & brakes',
    instructions: 'Show this code for your free 15-minute visual check.',
    validUntil: '30 days from booking'
  },
  'BYRD-BRAKESNAP': {
    name: 'Brake Life Snapshot (FREE)',
    value: '$35',
    description: 'Pad thickness + rotor photos—know your brake life',
    instructions: 'Present this code for your free brake life snapshot.',
    validUntil: '30 days from booking'
  },
  'BYRD-CHARGE': {
    name: 'Battery & Charging System Test (FREE)',
    value: '$45',
    description: 'Battery health + charging system—avoid breakdowns',
    instructions: 'Show this code for your free battery and charging system test.',
    validUntil: '30 days from booking'
  },
  'BYRD-TRIP': {
    name: 'Road‑Trip Readiness Check (FREE)',
    value: '$65',
    description: 'Complete safety sweep for your next adventure',
    instructions: 'Present this code for your free road-trip readiness check.',
    validUntil: '30 days from booking'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { offerCode, to, name } = req.body;

    if (!offerCode || !to || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: offerCode, to, name' 
      });
    }

    const template = COUPON_TEMPLATES[offerCode];
    if (!template) {
      return res.status(400).json({ 
        error: 'Invalid offer code' 
      });
    }

    const couponData = {
      code: offerCode,
      name: template.name,
      value: template.value,
      description: template.description,
      instructions: template.instructions,
      validUntil: template.validUntil,
      customerName: name,
      sentAt: new Date(),
      bookingUrl: `${process.env.TEKMETRIC_BOOK_URL}${encodeURIComponent(offerCode)}`
    };

    // Send SMS if phone number provided
    if (to.phone) {
      try {
        const smsMessage = `🎉 ${template.name} - Code: ${offerCode}\n\n${template.description}\n\nBook now: ${couponData.bookingUrl}\n\nByrd's Garage - (916) 991-1079\nValid for 30 days from booking.`;
        
        await twilioClient.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to.phone
        });
        
        console.log(`SMS sent to ${to.phone} for offer ${offerCode}`);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Continue with email even if SMS fails
      }
    }

    // Send email if email address provided
    if (to.email) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Free Inspection Coupon - Byrd's Garage</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
              .coupon { background: #f0f9ff; border: 2px dashed #2563eb; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
              .code { font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0; }
              .cta { background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
              .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Your Free Inspection Coupon!</h1>
                <p>Thank you for choosing Byrd's Garage</p>
              </div>
              
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>You've successfully claimed your free inspection offer. Here are the details:</p>
                
                <div class="coupon">
                  <h3>${template.name}</h3>
                  <div class="code">${offerCode}</div>
                  <p><strong>Value: ${template.value}</strong></p>
                  <p>${template.description}</p>
                  <p><em>${template.instructions}</em></p>
                </div>
                
                <p><strong>What's next?</strong></p>
                <ol>
                  <li>Click the button below to book your appointment</li>
                  <li>Your coupon code will be automatically applied</li>
                  <li>Bring your phone to check-in</li>
                </ol>
                
                <a href="${couponData.bookingUrl}" class="cta">Book Your Free Inspection Now</a>
                
                <p><strong>Important Details:</strong></p>
                <ul>
                  <li>Valid for 30 days from booking</li>
                  <li>One offer per customer</li>
                  <li>Not combinable with other offers</li>
                  <li>Visual checks are not full diagnostics</li>
                </ul>
                
                <p><strong>Our Location:</strong><br>
                220 Elverta Rd, Elverta, CA 95626<br>
                Phone: (916) 991-1079<br>
                Hours: Mon–Fri 8:00 AM – 5:00 PM</p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Byrd's Garage. All rights reserved.</p>
                <p>This email was sent because you requested a free inspection offer.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await emailTransporter.sendMail({
          from: `"Byrd's Garage" <${process.env.SMTP_USER}>`,
          to: to.email,
          subject: `🎉 Your Free Inspection Coupon - Code: ${offerCode}`,
          html: emailHtml
        });
        
        console.log(`Email sent to ${to.email} for offer ${offerCode}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue even if email fails
      }
    }

    // Update lead record in database
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('byrds-garage');
    const leadsCollection = db.collection('leads');
    
    await leadsCollection.updateOne(
      { 
        phone: to.phone,
        offerCode: offerCode,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      { 
        $set: { 
          couponSent: true,
          couponSentAt: new Date(),
          couponData: couponData
        } 
      }
    );
    
    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Coupon sent successfully',
      couponData: couponData
    });

  } catch (error) {
    console.error('Error sending coupon:', error);
    return res.status(500).json({ 
      error: 'Failed to send coupon. Please try again or contact us directly.' 
    });
  }
}
