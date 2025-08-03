import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db';
import config from './config/config';
import fs from 'fs';

// Import routes
import productRoutes from './routes/productRoutes';
import teamRoutes from './routes/teamRoutes';
import eventRoutes from './routes/eventRoutes';
import memberRoutes from './routes/memberRoutes';
import registrationRoutes from './routes/registrationRoutes';
import newsRoutes from './routes/newsRoutes';
import partnerRoutes from './routes/partnerRoutes';
import gameRoutes from './routes/games';
import videoRoutes from './routes/videoRoutes';
import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Setup CORS
app.use(cors());

// JSON parser middleware
app.use(express.json());

// URL encoded parser middleware
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(morgan('dev'));

// Create uploads directories and test images
const createTestFiles = () => {
  const fs = require('fs');
  const path = require('path');
  
  // Create main uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  }
  
  // Create news directory
  const newsDir = path.join(uploadsDir, 'news');
  if (!fs.existsSync(newsDir)) {
    fs.mkdirSync(newsDir, { recursive: true });
    console.log('Created news directory:', newsDir);
  }
  
  // Create partners directory
  const partnersDir = path.join(uploadsDir, 'partners');
  if (!fs.existsSync(partnersDir)) {
    fs.mkdirSync(partnersDir, { recursive: true });
    console.log('Created partners directory:', partnersDir);
  }
  
  // Create images directory for games
  const imagesDir = path.join(uploadsDir, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);
  }
  
  // Create test image for fallback - ensure it's directly in uploads folder
  const testImagePath = path.join(uploadsDir, 'test-image.jpg');
  if (!fs.existsSync(testImagePath)) {
    try {
      // Create a simple 1x1 pixel JPEG image
      const imageData = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 
        0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc2, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 
        0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 
        0x00, 0x01, 0x3f, 0x10
      ]);
      
      fs.writeFileSync(testImagePath, imageData);
      console.log('Created test image:', testImagePath);
      
      // Create a copy in the news folder as well
      const newsTestImagePath = path.join(newsDir, 'test-image.jpg');
      fs.copyFileSync(testImagePath, newsTestImagePath);
      console.log('Copied test image to news folder:', newsTestImagePath);
      
      // Create a copy in the partners folder as well
      const partnersTestImagePath = path.join(partnersDir, 'test-image.jpg');
      fs.copyFileSync(testImagePath, partnersTestImagePath);
      console.log('Copied test image to partners folder:', partnersTestImagePath);
      
      // Create a copy in the images folder as well
      const imagesTestImagePath = path.join(imagesDir, 'test-image.jpg');
      fs.copyFileSync(testImagePath, imagesTestImagePath);
      console.log('Copied test image to images folder:', imagesTestImagePath);
    } catch (error) {
      console.error('Error creating test image:', error);
    }
  }
};

// Create test files on startup
createTestFiles();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.environment 
  });
});

// Test endpoint for debugging
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'TeamWave API is running!',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    port: config.port
  });
});

// Test endpoint for file system debugging
app.get('/api/debug-files', (req: Request, res: Response) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const testImagePath = path.join(uploadsDir, 'test-image.jpg');
  const newsDir = path.join(uploadsDir, 'news');
  const newsTestImagePath = path.join(newsDir, 'test-image.jpg');
  
  let uploadsDirExists = fs.existsSync(uploadsDir);
  let testImageExists = fs.existsSync(testImagePath);
  let newsDirExists = fs.existsSync(newsDir);
  let newsTestImageExists = fs.existsSync(newsTestImagePath);
  
  try {
    
    // Ensure directories exist
    if (!uploadsDirExists) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory:', uploadsDir);
    }
    uploadsDirExists = fs.existsSync(uploadsDir);
    
    if (!newsDirExists) {
      fs.mkdirSync(newsDir, { recursive: true });
      console.log('Created news directory:', newsDir);
    }
    newsDirExists = fs.existsSync(newsDir);
    
    // Create test image for fallback if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      // Create a simple 1x1 pixel JPEG image
      const imageData = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 
        0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc2, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 
        0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 
        0x00, 0x01, 0x3f, 0x10
      ]);
      
      fs.writeFileSync(testImagePath, imageData);
      console.log('Created test image:', testImagePath);
    }
    testImageExists = fs.existsSync(testImagePath);
    
    // Ensure test image exists in news folder as well
    if (!fs.existsSync(newsTestImagePath) && testImageExists) {
      fs.copyFileSync(testImagePath, newsTestImagePath);
      console.log('Copied test image to news folder:', newsTestImagePath);
    }
    newsTestImageExists = fs.existsSync(newsTestImagePath);
    
    res.json({
      success: true,
      paths: {
        uploadsDir: {
          path: uploadsDir,
          exists: uploadsDirExists
        },
        testImage: {
          path: testImagePath,
          exists: testImageExists,
          url: '/uploads/test-image.jpg',
          directUrl: '/api/direct-test-image'
        },
        newsDir: {
          path: newsDir,
          exists: newsDirExists
        },
        newsTestImage: {
          path: newsTestImagePath,
          exists: newsTestImageExists,
          url: '/uploads/news/test-image.jpg'
        }
      }
    });
  } catch (error: any) {
    console.error('Error ensuring test image:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      paths: {
        uploadsDir: {
          path: uploadsDir || 'unknown',
          exists: uploadsDirExists || false
        },
        testImage: {
          path: testImagePath || 'unknown',
          exists: testImageExists || false
        },
        newsDir: {
          path: newsDir || 'unknown',
          exists: newsDirExists || false
        },
        newsTestImage: {
          path: newsTestImagePath || 'unknown',
          exists: newsTestImageExists || false
        }
      }
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    stack: config.environment === 'development' ? err.stack : undefined
  });
});

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Server running in ${config.environment} mode on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless functions
export default app; 