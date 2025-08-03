import mongoose from 'mongoose';
import config from './config';

const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Running with mock data instead of MongoDB connection');
    
    // Setting up mock data in this case should be done in the respective controllers
    // Here we just log the error but don't exit the process
    if (config.environment === 'development') {
      console.warn('Continuing without database in development mode');
    } else {
      console.error('Database connection is required in production. Exiting.');
      process.exit(1);
    }
  }
};

export default connectDB; 