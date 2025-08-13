const mongoose = require('mongoose');

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    // Use the default MongoDB connection string
    await mongoose.connect('mongodb://localhost:27017/teamwave-db');
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    const collection = db.collection('games');

    console.log('Checking current indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    console.log('Attempting to drop slug_1 index...');
    try {
      await collection.dropIndex('slug_1');
      console.log('✓ Successfully dropped slug_1 index');
    } catch (error) {
      console.log('No slug_1 index found or already dropped');
    }

    console.log('✓ Database fix completed!');
    console.log('You can now create games without the slug error.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixDatabase();
