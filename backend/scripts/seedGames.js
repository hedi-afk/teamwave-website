const mongoose = require('mongoose');
const Game = require('../models/Game');
const config = require('../config/config');

const games = [
  { name: 'CS:GO', featured: true, order: 0 },
  { name: 'Valorant', featured: true, order: 1 },
  { name: 'League of Legends', featured: true, order: 2 },
  { name: 'Dota 2', featured: false, order: 3 },
  { name: 'Overwatch 2', featured: false, order: 4 },
  { name: 'Rocket League', featured: false, order: 5 },
  { name: 'FIFA 24', featured: false, order: 6 },
  { name: 'Call of Duty', featured: false, order: 7 }
];

async function seedGames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing games
    await Game.deleteMany({});
    console.log('Cleared existing games');

    // Insert new games
    const createdGames = await Game.insertMany(games);
    console.log(`Created ${createdGames.length} games:`);
    
    createdGames.forEach(game => {
      console.log(`- ${game.name} (Featured: ${game.featured})`);
    });

    console.log('Games seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding games:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedGames(); 