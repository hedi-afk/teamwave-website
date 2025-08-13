const mongoose = require('mongoose');
const Game = require('../models/Game');
const config = require('../config/config');

async function fixGameIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.collection('games');
    
    // Check existing indexes
    console.log('\n1. Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Check for duplicate names in the database
    console.log('\n2. Checking for duplicate names...');
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: { $toLower: "$name" },
          count: { $sum: 1 },
          names: { $push: "$name" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();

    if (duplicates.length > 0) {
      console.log('Found duplicate names:');
      duplicates.forEach(dup => {
        console.log(`- "${dup.names.join('", "')}" (${dup.count} instances)`);
      });
    } else {
      console.log('No duplicate names found');
    }

    // Drop the unique index if it exists
    console.log('\n3. Dropping existing unique index...');
    try {
      await collection.dropIndex('name_1');
      console.log('✓ Dropped existing unique index');
    } catch (error) {
      console.log('No existing unique index to drop');
    }

    // Create a new unique index
    console.log('\n4. Creating new unique index...');
    await collection.createIndex({ name: 1 }, { unique: true });
    console.log('✓ Created new unique index on name field');

    // Test the index
    console.log('\n5. Testing the index...');
    const testGame = new Game({
      name: 'Test Index Game',
      featured: true,
      order: 999
    });
    
    await testGame.save();
    console.log('✓ Successfully created test game');
    
    // Try to create another with same name
    try {
      const duplicateGame = new Game({
        name: 'Test Index Game',
        featured: false,
        order: 1000
      });
      await duplicateGame.save();
      console.log('✗ Should have failed - index not working');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✓ Index working correctly - prevented duplicate');
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }

    // Clean up test game
    await Game.findByIdAndDelete(testGame._id);
    console.log('✓ Cleaned up test game');

    console.log('\n✓ Index fix completed successfully!');

  } catch (error) {
    console.error('Error fixing game index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixGameIndex();
