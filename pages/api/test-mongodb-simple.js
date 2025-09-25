import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    // Simple connection without Stable API for testing
    const client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Test database access
    const db = client.db('byrds-garage-leads');
    const leadsCollection = db.collection('leads');
    
    // Count existing leads
    const leadCount = await leadsCollection.countDocuments();
    console.log('Lead count:', leadCount);
    
    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Successfully connected to MongoDB with simple configuration!',
      database: 'byrds-garage-leads',
      collection: 'leads',
      existingLeads: leadCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to MongoDB',
      details: error.message,
      code: error.code,
      name: error.name
    });
  }
}
