import { MongoClient, ServerApiVersion } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Get all leads sorted by creation date (newest first)
    const leads = await leadsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100) // Limit to last 100 leads for performance
      .toArray();

    // Calculate statistics
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));

    const stats = {
      total: leads.length,
      today: leads.filter(lead => new Date(lead.createdAt) >= startOfDay).length,
      thisWeek: leads.filter(lead => new Date(lead.createdAt) >= startOfWeek).length,
      couponSent: leads.filter(lead => lead.couponSent).length,
      bookingRedirected: leads.filter(lead => lead.bookingRedirected).length
    };

    await client.close();

    return res.status(200).json({
      success: true,
      leads: leads,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch leads' 
    });
  }
}
