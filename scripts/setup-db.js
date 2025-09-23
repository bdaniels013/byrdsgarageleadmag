const { MongoClient } = require('mongodb');

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/byrds-garage');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('byrds-garage');
    
    // Create collections with indexes
    const leadsCollection = db.collection('leads');
    const upsellsCollection = db.collection('upsells');
    
    // Create indexes for better performance
    await leadsCollection.createIndex({ phone: 1, offerCode: 1 });
    await leadsCollection.createIndex({ createdAt: -1 });
    await leadsCollection.createIndex({ email: 1 });
    await leadsCollection.createIndex({ status: 1 });
    
    await upsellsCollection.createIndex({ timestamp: -1 });
    await upsellsCollection.createIndex({ product: 1 });
    await upsellsCollection.createIndex({ offer: 1 });
    
    console.log('Database setup completed successfully');
    console.log('Collections created: leads, upsells');
    console.log('Indexes created for optimal performance');
    
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await client.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
