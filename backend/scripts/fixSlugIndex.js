const mongoose = require('mongoose');
const config = require('../config/config');

async function fixSlugIndex() {
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

    // Check for games with null slug
    console.log('\n2. Checking for games with null slug...');
    const nullSlugGames = await collection.find({ slug: null }).toArray();
    console.log(`Found ${nullSlugGames.length} games with null slug`);

    // Drop the problematic slug index
    console.log('\n3. Dropping problematic slug index...');
    try {
      await collection.dropIndex('slug_1');
      console.log('✓ Dropped slug_1 index');
    } catch (error) {
      console.log('No slug_1 index to drop');
    }

    // Create a new sparse index on slug
    console.log('\n4. Creating new sparse slug index...');
    await collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
    console.log('✓ Created new sparse slug index');

    // Update all games with null slug to have a unique slug based on name
    console.log('\n5. Updating games with null slug...');
    const gamesToUpdate = await collection.find({ slug: null }).toArray();
    
    for (const game of gamesToUpdate) {
      const slug = game.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      await collection.updateOne(
        { _id: game._id },
        { $set: { slug: slug } }
      );
      console.log(`Updated game "${game.name}" with slug: ${slug}`);
    }

    console.log('\n✓ Slug index fix completed successfully!');

  } catch (error) {
    console.error('Error fixing slug index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixSlugIndex();

