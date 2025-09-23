import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product, offer, email, phone } = req.body;

    if (!product || !offer) {
      return res.status(400).json({ 
        error: 'Missing required fields: product, offer' 
      });
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('byrds-garage');
    const upsellsCollection = db.collection('upsells');

    // Record upsell interaction
    const upsellData = {
      product,
      offer,
      email: email || '',
      phone: phone || '',
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      timestamp: new Date(),
      status: 'viewed'
    };

    const result = await upsellsCollection.insertOne(upsellData);
    
    await client.close();

    console.log(`Upsell interaction recorded: ${product} for offer ${offer}`);

    return res.status(201).json({
      success: true,
      upsellId: result.insertedId,
      message: 'Upsell interaction recorded'
    });

  } catch (error) {
    console.error('Error recording upsell:', error);
    return res.status(500).json({ 
      error: 'Failed to record upsell interaction' 
    });
  }
}
