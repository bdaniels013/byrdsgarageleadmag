import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== TESTING SIMPLE LEAD CAPTURE ===');
    console.log('Request body:', req.body);
    
    const { firstName, lastName, phone, email, vehicle, offerCode } = req.body;

    // Basic validation
    if (!firstName || !phone) {
      console.log('Validation failed: missing firstName or phone');
      return res.status(400).json({ 
        error: 'First name and phone number are required' 
      });
    }

    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB with simple configuration
    const client = new MongoClient(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db('byrds-garage-leads');
    const leadsCollection = db.collection('leads');

    // Create test lead document
    const leadData = {
      firstName: firstName.trim(),
      lastName: lastName?.trim() || '',
      phone: phone.trim(),
      email: email?.trim() || '',
      vehicle: vehicle?.trim() || '',
      offerCode: offerCode || 'TEST',
      createdAt: new Date(),
      status: 'pending',
      testLead: true
    };

    console.log('Inserting lead data:', leadData);

    // Insert lead into database
    const result = await leadsCollection.insertOne(leadData);
    console.log('Lead inserted successfully:', result.insertedId);
    
    await client.close();

    return res.status(201).json({
      success: true,
      leadId: result.insertedId,
      message: 'Test lead captured successfully',
      data: leadData
    });

  } catch (error) {
    console.error('=== LEAD CAPTURE ERROR ===');
    console.error('Error details:', error);
    return res.status(500).json({ 
      error: 'Failed to capture lead',
      details: error.message,
      stack: error.stack
    });
  }
}
