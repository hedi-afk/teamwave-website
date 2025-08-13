const mongoose = require('mongoose');
const Game = require('../models/Game');
const config = require('../config/config');

async function testGameOperations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const testGameName = 'Test Game for Delete';

    // Step 1: Create a test game
    console.log('\n1. Creating test game...');
    const newGame = new Game({
      name: testGameName,
      featured: true,
      order: 999
    });
    await newGame.save();
    console.log(`✓ Created game: ${newGame.name} (ID: ${newGame._id})`);

    // Step 2: Verify the game exists
    console.log('\n2. Verifying game exists...');
    const existingGame = await Game.findOne({ name: testGameName });
    if (existingGame) {
      console.log(`✓ Game found: ${existingGame.name}`);
    } else {
      console.log('✗ Game not found!');
      return;
    }

    // Step 3: Delete the game
    console.log('\n3. Deleting the game...');
    await Game.findByIdAndDelete(existingGame._id);
    console.log(`✓ Deleted game: ${existingGame.name}`);

    // Step 4: Verify the game is deleted
    console.log('\n4. Verifying game is deleted...');
    const deletedGame = await Game.findOne({ name: testGameName });
    if (!deletedGame) {
      console.log('✓ Game successfully deleted');
    } else {
      console.log('✗ Game still exists!');
      return;
    }

    // Step 5: Try to create a game with the same name
    console.log('\n5. Testing recreation with same name...');
    try {
      const recreatedGame = new Game({
        name: testGameName,
        featured: false,
        order: 1000
      });
      await recreatedGame.save();
      console.log(`✓ Successfully recreated game: ${recreatedGame.name}`);
      
      // Clean up
      await Game.findByIdAndDelete(recreatedGame._id);
      console.log('✓ Cleaned up test game');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✗ Failed to recreate game - unique constraint error');
        console.log('This indicates the delete operation did not work properly');
      } else {
        console.log('✗ Failed to recreate game:', error.message);
      }
    }

    console.log('\n✓ Test completed successfully!');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testGameOperations();
