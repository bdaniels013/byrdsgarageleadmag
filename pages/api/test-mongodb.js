import { MongoClient, ServerApiVersion } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB with Stable API
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Test database access
    const db = client.db('byrds-garage-leads');
    const leadsCollection = db.collection('leads');
    
    // Count existing leads
    const leadCount = await leadsCollection.countDocuments();
    
    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Successfully connected to MongoDB!',
      database: 'byrds-garage-leads',
      collection: 'leads',
      existingLeads: leadCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to MongoDB',
      details: error.message
    });
  }
}
