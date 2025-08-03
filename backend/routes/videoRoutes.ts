import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getFeaturedVideos,
  getVideosByCategory,
  searchVideos
} from '../controllers/videoController';
import { protect } from '../middleware/authMiddleware';
import { uploadImage, uploadVideo, uploadMixed } from '../middleware/uploadMiddleware';

const router = express.Router();

// Public routes
router.get('/', getAllVideos);
router.get('/featured', getFeaturedVideos);
router.get('/category/:category', getVideosByCategory);
router.get('/search', searchVideos);
router.get('/:id', getVideoById);

// Upload routes
router.post('/upload/thumbnail', protect, uploadMixed.single('thumbnail'), (req, res) => {
  try {
    console.log('POST /api/videos/upload/thumbnail - Upload thumbnail request received');
    
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
    
    // Determine if it's an image or video based on mimetype
    const isImage = req.file.mimetype.startsWith('image/');
    const isVideo = req.file.mimetype.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return res.status(400).json({
        message: 'Thumbnail must be an image or video file',
        success: false
      });
    }
    
    // Build the relative path to be stored in the database
    const folder = isImage ? 'images' : 'videos';
    const relativePath = path.join(folder, req.file.filename).replace(/\\/g, '/');
    
    // Double-check file existence and log it
    const fullPath = req.file.path;
    const fileExists = fs.existsSync(fullPath);
    
    console.log('File verification:', {
      relativePath,
      fullPath,
      exists: fileExists,
      size: fileExists ? fs.statSync(fullPath).size : 'N/A',
      type: isImage ? 'image' : 'video'
    });
    
    if (!fileExists) {
      console.error('The uploaded file could not be found at the expected location');
      return res.status(500).json({ 
        message: 'File upload processing error: File not found after upload',
        success: false 
      });
    }
    
    // Send back the relative path and type to be stored in the database
    res.json({
      message: 'Thumbnail uploaded successfully',
      imagePath: relativePath,
      thumbnailType: isImage ? 'image' : 'video',
      success: true
    });
  } catch (error: any) {
    console.error('Error uploading thumbnail:', error);
    res.status(500).json({ 
      message: 'Error uploading thumbnail', 
      error: error.message,
      success: false 
    });
  }
});

router.post('/upload/video', protect, uploadVideo.single('video'), (req, res) => {
  try {
    console.log('POST /api/videos/upload/video - Upload video request received');
    
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
    const relativePath = path.join('videos', req.file.filename).replace(/\\/g, '/');
    
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
    res.json({
      message: 'Video uploaded successfully',
      videoPath: relativePath,
      success: true
    });
  } catch (error: any) {
    console.error('Error uploading video:', error);
    res.status(500).json({ 
      message: 'Error uploading video', 
      error: error.message,
      success: false 
    });
  }
});

// Protected routes (admin only)
router.post('/', protect, createVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);

export default router; 