import mongoose from 'mongoose';
import config from './config';

const connectDB = async () => {
  try {
    const mongoUri = config.mongoUri;
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI (masked):', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(mongoUri, {
      // MongoDB connection options
    });
    
    console.log('MongoDB connected successfully!');
    if (mongoose.connection.db) {
      console.log('Database:', mongoose.connection.db.databaseName);
    }
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit in production, let the app continue with limited functionality
    if (process.env.NODE_ENV === 'production') {
      console.log('Continuing without database connection in production...');
    } else {
      process.exit(1);
    }
  }
};

export default connectDB; 