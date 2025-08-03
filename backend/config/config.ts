import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/teamwave-db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '1d',
};

export default config; 