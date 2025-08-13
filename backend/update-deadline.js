const mongoose = require('mongoose');

// Connect to MongoDB directly
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/teamwave-db';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Event schema inline
const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  game: String,
  startDate: Date,
  endDate: Date,
  registrationDeadline: Date,
  status: String,
  image: String,
  participants: [String],
  prize: String,
  registration_link: String
});

const Event = mongoose.model('Event', eventSchema);

async function updateDeadline() {
  try {
    // Find the Valorant event
    const event = await Event.findOne({ name: 'Valorant Tryouts' });
    
    if (!event) {
      console.log('Valorant Tryouts event not found');
      return;
    }
    
    console.log('Current event details:');
    console.log(`Name: ${event.name}`);
    console.log(`Current deadline: ${event.registrationDeadline}`);
    
    // Update the deadline to August 14, 2025
    const newDeadline = new Date('2025-08-14T23:59:59.000Z');
    
    event.registrationDeadline = newDeadline;
    await event.save();
    
    console.log(`\nUpdated deadline to: ${newDeadline}`);
    console.log('Registration should now be open!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateDeadline();


