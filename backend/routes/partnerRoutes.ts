import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Partner, { IPartner } from '../models/Partner';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create directory if it doesn't exist
    const dir = path.join(process.cwd(), 'uploads', 'partners');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`;
    cb(null, fileName);
  }
});

// File filter to only allow image files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * @route   GET /api/partners
 * @desc    Get all partners
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Allow filtering by type (partner or sponsor)
    const filter: any = {};
    if (req.query.type && ['partner', 'sponsor'].includes(req.query.type as string)) {
      filter.type = req.query.type;
    }
    
    // Add active filter if requested
    if (req.query.active === 'true') {
      filter.active = true;
    } else if (req.query.active === 'false') {
      filter.active = false;
    }
    
    const partners = await Partner.find(filter).sort({ name: 1 });
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/partners/:id
 * @desc    Get partner by ID
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json(partner);
  } catch (error) {
    console.error(`Error fetching partner with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/partners
 * @desc    Create a new partner
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const newPartner = new Partner(req.body);
    const savedPartner = await newPartner.save();
    res.status(201).json(savedPartner);
  } catch (error) {
    console.error('Error creating partner:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/partners/:id
 * @desc    Update a partner
 * @access  Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!updatedPartner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json(updatedPartner);
  } catch (error) {
    console.error(`Error updating partner with ID ${req.params.id}:`, error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/partners/:id
 * @desc    Delete a partner
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Delete the partner
    await partner.deleteOne();
    
    // Optionally, delete the partner's logo file
    if (partner.logo && !partner.logo.startsWith('http')) {
      const logoPath = path.join(process.cwd(), partner.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }
    
    res.json({ message: 'Partner removed' });
  } catch (error) {
    console.error(`Error deleting partner with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/partners/upload
 * @desc    Upload a partner logo
 * @access  Private
 */
router.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Generate the path to the uploaded file
    const imagePath = `/uploads/partners/${req.file.filename}`;
    
    res.json({ 
      message: 'File uploaded successfully',
      imagePath 
    });
  } catch (error) {
    console.error('Error uploading partner logo:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

export default router; 