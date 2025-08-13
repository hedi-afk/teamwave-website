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

async function checkEvents() {
  try {
    const events = await Event.find({});
    console.log('\n=== EVENTS IN DATABASE ===');
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. Event: ${event.name}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Start Date: ${event.startDate}`);
      console.log(`   Registration Deadline: ${event.registrationDeadline}`);
      
      if (event.registrationDeadline) {
        const deadline = new Date(event.registrationDeadline);
        const now = new Date();
        console.log(`   Current Date: ${now}`);
        console.log(`   Deadline < Now: ${deadline < now}`);
        console.log(`   Registration Allowed: ${deadline > now}`);
      } else {
        console.log(`   No registration deadline set`);
      }
    });
    
    console.log('\n=== SUMMARY ===');
    const upcomingEvents = events.filter(e => e.status === 'upcoming');
    console.log(`Total events: ${events.length}`);
    console.log(`Upcoming events: ${upcomingEvents.length}`);
    
    upcomingEvents.forEach(event => {
      if (event.registrationDeadline) {
        const deadline = new Date(event.registrationDeadline);
        const now = new Date();
        console.log(`- ${event.name}: ${deadline > now ? 'OPEN' : 'CLOSED'} (deadline: ${deadline})`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkEvents();


