import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Checking database contents...');
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    await client.connect();
    const db = client.db('byrds-garage-leads');
    const leadsCollection = db.collection('leads');

    // Get database stats
    const totalLeads = await leadsCollection.countDocuments();
    const recentLeads = await leadsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    // Get unique offer codes
    const offerCodes = await leadsCollection.distinct('offerCode');
    
    // Get leads by date (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLeadsCount = await leadsCollection.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    await client.close();

    return res.status(200).json({
      success: true,
      database: 'byrds-garage-leads',
      collection: 'leads',
      stats: {
        totalLeads: totalLeads,
        recentLeadsLast7Days: recentLeadsCount,
        uniqueOfferCodes: offerCodes
      },
      recentLeads: recentLeads.map(lead => ({
        id: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        email: lead.email,
        vehicle: lead.vehicle,
        offerCode: lead.offerCode,
        createdAt: lead.createdAt,
        status: lead.status
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database check error:', error);
    return res.status(500).json({ 
      error: 'Failed to check database',
      details: error.message
    });
  }
}
