import mongoose from 'mongoose';
import config from './config';

const connectDB = async () => {
  try {
    const mongoUri = config.mongoUri;
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      // MongoDB connection options
    });
    
    console.log('MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 