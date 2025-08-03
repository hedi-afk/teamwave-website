import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import News from '../models/News';

const router = express.Router();

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'news');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Set up file filter for images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
  }
};

// Initialize the upload middleware
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Mock news data for fallback - ensure test-image.jpg path is used
const mockNewsArticles = [
  {
    title: 'TeamWave Signs New CS:GO Roster',
    excerpt: 'We\'re thrilled to announce our new professional CS:GO team joining the TeamWave family.',
    content: 'TeamWave is proud to welcome five exceptional CS:GO players to our professional roster. The team consists of veterans from the competitive scene who have competed at the highest levels.',
    image: 'test-image.jpg', // Direct reference to test-image.jpg
    date: new Date('2023-07-21'),
    author: 'Admin',
    category: 'team',
    published: true
  },
  {
    title: 'Summer Tournament Series Announced',
    excerpt: 'Join us for a summer filled with competitive gaming and amazing prizes.',
    content: 'TeamWave is hosting a series of tournaments throughout the summer with competitions in CS:GO, Valorant, and League of Legends.',
    image: 'test-image.jpg', // Direct reference to test-image.jpg
    date: new Date('2023-07-18'),
    author: 'Admin',
    category: 'event',
    published: true
  },
  {
    title: 'New Partnership with GamingGear',
    excerpt: 'TeamWave partners with GamingGear to provide members with exclusive equipment discounts.',
    content: 'We\'re excited to announce our new partnership with GamingGear, a leading provider of high-quality gaming peripherals.',
    image: 'test-image.jpg', // Direct reference to test-image.jpg
    date: new Date('2023-07-15'),
    author: 'Admin',
    category: 'partnership',
    published: true
  }
];

// Helper function to seed mock data if no articles exist
const seedMockDataIfNeeded = async () => {
  try {
    // Check if test-image.jpg exists
    const testImagePath = path.join(process.cwd(), 'uploads', 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      console.error('Warning: test-image.jpg not found at', testImagePath);
      console.error('Images might not display correctly');
    } else {
      console.log('Found test image at:', testImagePath);
    }
    
    const count = await News.countDocuments();
    if (count === 0) {
      console.log('No news articles found in database, seeding with mock data');
      try {
        await News.insertMany(mockNewsArticles);
        console.log('Mock news data seeded successfully');
      } catch (insertError: any) {
        console.error('Error inserting mock data:', insertError.message);
        
        // Try one by one if bulk insert fails
        console.log('Trying to insert articles one by one');
        for (const article of mockNewsArticles) {
          try {
            const newsArticle = new News(article);
            await newsArticle.save();
            console.log('Inserted article:', newsArticle.title);
          } catch (singleError: any) {
            console.error('Failed to insert article:', singleError.message);
          }
        }
      }
    } else {
      console.log(`Found ${count} existing news articles, skipping seed data`);
    }
  } catch (error: any) {
    console.error('Error seeding mock data:', error);
  }
};

// Seed mock data when the routes are initialized
seedMockDataIfNeeded();

// GET all news articles
router.get('/', async (req, res) => {
  console.log('GET /api/news - Retrieving all news articles');
  try {
    const articles = await News.find().sort({ date: -1 });
    res.json(articles);
  } catch (error: any) {
    console.error('Error retrieving news articles:', error);
    res.status(500).json({ message: 'Error retrieving news articles', error: error.message });
  }
});

// GET published news articles
router.get('/published', async (req, res) => {
  console.log('GET /api/news/published - Retrieving published news');
  try {
    const articles = await News.find({ published: true }).sort({ date: -1 });
    res.json(articles);
  } catch (error: any) {
    console.error('Error retrieving published news:', error);
    res.status(500).json({ message: 'Error retrieving published news', error: error.message });
  }
});

// GET news article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error: any) {
    console.error('Error retrieving news article:', error);
    res.status(500).json({ message: 'Error retrieving news article', error: error.message });
  }
});

// POST create a new article
router.post('/', async (req, res) => {
  console.log('POST /api/news - Create new article');
  try {
    const newArticle = new News(req.body);
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error: any) {
    console.error('Error creating news article:', error);
    res.status(400).json({ message: 'Error creating news article', error: error.message });
  }
});

// PUT update an article
router.put('/:id', async (req, res) => {
  console.log(`PUT /api/news/${req.params.id} - Update article`);
  try {
    const article = await News.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.json(article);
  } catch (error: any) {
    console.error('Error updating news article:', error);
    res.status(400).json({ message: 'Error updating news article', error: error.message });
  }
});

// DELETE an article
router.delete('/:id', async (req, res) => {
  console.log(`DELETE /api/news/${req.params.id} - Delete article`);
  try {
    const article = await News.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting news article:', error);
    res.status(500).json({ message: 'Error deleting news article', error: error.message });
  }
});

// PATCH toggle publish status
router.patch('/:id/publish', async (req, res) => {
  console.log(`PATCH /api/news/${req.params.id}/publish - Toggle publish status`);
  try {
    const article = await News.findByIdAndUpdate(
      req.params.id,
      { published: req.body.published },
      { new: true }
    );
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.json(article);
  } catch (error: any) {
    console.error('Error updating publish status:', error);
    res.status(500).json({ message: 'Error updating publish status', error: error.message });
  }
});

// POST upload news image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    console.log('POST /api/news/upload - Upload news image request received');
    console.log('Request headers:', req.headers);
    
    if (!req.file) {
      console.error('No file received in the request');
      return res.status(400).json({ 
        message: 'No file uploaded',
        success: false 
      });
    }
    
    // Log detailed information about the file
    console.log('File received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    // Build the relative path to be stored in the database
    // This will be news/filename.jpg
    const relativePath = path.join('news', req.file.filename).replace(/\\/g, '/');
    
    // Double-check file existence and log it
    const fullPath = req.file.path;
    const fileExists = fs.existsSync(fullPath);
    
    console.log('File verification:', {
      relativePath,
      fullPath,
      exists: fileExists,
      size: fileExists ? fs.statSync(fullPath).size : 'N/A'
    });
    
    if (!fileExists) {
      console.error('The uploaded file could not be found at the expected location');
      return res.status(500).json({ 
        message: 'File upload processing error: File not found after upload',
        success: false 
      });
    }
    
    // Send back the relative path to be stored in the database
    // The frontend will then construct the full URL using the config.imageBaseUrl
    res.json({
      message: 'File uploaded successfully',
      imagePath: relativePath,
      fullPath: fullPath, // For debugging only
      success: true
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      success: false
    });
  }
});

export default router; 