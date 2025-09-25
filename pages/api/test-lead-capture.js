import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing lead capture...');
    
    // Test data
    const testLead = {
      firstName: 'Test',
      lastName: 'User',
      phone: '555-123-4567',
      email: 'test@example.com',
      vehicle: '2020 Honda Civic',
      concern: 'Test concern',
      offerCode: 'TEST-LEAD',
      marketingOptIn: true,
      utm: {},
      page: '/test',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      createdAt: new Date(),
      status: 'pending',
      couponSent: false,
      bookingRedirected: false,
      paymentCollected: false
    };

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    await client.connect();
    const db = client.db('byrds-garage-leads');
    const leadsCollection = db.collection('leads');

    // Insert test lead
    const result = await leadsCollection.insertOne(testLead);
    console.log('Test lead inserted:', result.insertedId);
    
    // Count total leads
    const totalLeads = await leadsCollection.countDocuments();
    console.log('Total leads in database:', totalLeads);
    
    // Get recent leads
    const recentLeads = await leadsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Test lead captured successfully!',
      testLeadId: result.insertedId,
      totalLeads: totalLeads,
      recentLeads: recentLeads.map(lead => ({
        id: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        email: lead.email,
        offerCode: lead.offerCode,
        createdAt: lead.createdAt
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test lead capture error:', error);
    return res.status(500).json({ 
      error: 'Failed to capture test lead',
      details: error.message
    });
  }
}
