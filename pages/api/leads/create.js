import { MongoClient, ServerApiVersion } from 'mongodb';
import rateLimit from 'express-rate-limit';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export default async function handler(req, res) {
  // Apply rate limiting
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      vehicle,
      concern,
      offerCode,
      marketingOptIn,
      utm,
      page,
      timestamp
    } = req.body;

    // Basic validation
    if (!firstName || !phone) {
      return res.status(400).json({ 
        error: 'First name and phone number are required' 
      });
    }

    // Connect to MongoDB with Stable API
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    const db = client.db('byrds-garage-leads');
    const leadsCollection = db.collection('leads');

    // Check for duplicate leads (same phone number and offer code)
    const existingLead = await leadsCollection.findOne({
      phone: phone,
      offerCode: offerCode,
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    });

    if (existingLead) {
      await client.close();
      return res.status(409).json({ 
        error: 'You have already claimed this offer recently. Please try a different offer or contact us directly.' 
      });
    }

    // Create lead document
    const leadData = {
      firstName: firstName.trim(),
      lastName: lastName?.trim() || '',
      phone: phone.trim(),
      email: email?.trim() || '',
      vehicle: vehicle?.trim() || '',
      concern: concern?.trim() || '',
      offerCode,
      marketingOptIn: Boolean(marketingOptIn),
      utm: utm || {},
      page: page || '',
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      createdAt: new Date(),
      status: 'pending',
      couponSent: false,
      bookingRedirected: false,
      paymentCollected: false
    };

    // Insert lead into database
    const result = await leadsCollection.insertOne(leadData);
    
    await client.close();

    // Log successful lead capture
    console.log(`New lead captured: ${firstName} ${lastName} - ${phone} - ${offerCode}`);

    return res.status(201).json({
      success: true,
      leadId: result.insertedId,
      message: 'Lead captured successfully'
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
}

// Apply rate limiting middleware
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
