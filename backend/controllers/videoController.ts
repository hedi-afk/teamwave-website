import { Request, Response } from 'express';
import Video, { IVideo } from '../models/Video';

// Get all videos (with optional filtering)
export const getAllVideos = async (req: Request, res: Response) => {
  try {
    const { category, featured, isPublic, limit = 20, page = 1 } = req.query;
    
    const filter: any = {};
    
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    
    const total = await Video.countDocuments(filter);
    
    res.json({
      videos,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + videos.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

// Get a single video by ID
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id).lean();
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Increment view count
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    res.json(video);
  } catch (error: any) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Error fetching video', error: error.message });
  }
};

// Create a new video
export const createVideo = async (req: Request, res: Response) => {
  try {
    const videoData = req.body;
    
    // Ensure either videoFile or videoUrl is provided
    if (!videoData.videoFile && !videoData.videoUrl) {
      return res.status(400).json({ 
        message: 'Either video file or video URL must be provided' 
      });
    }
    
    const video = new Video(videoData);
    await video.save();
    
    res.status(201).json({
      message: 'Video created successfully',
      video
    });
  } catch (error: any) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Error creating video', error: error.message });
  }
};

// Update a video
export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const video = await Video.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json({
      message: 'Video updated successfully',
      video
    });
  } catch (error: any) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
};

// Delete a video
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findByIdAndDelete(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
};

// Get featured videos
export const getFeaturedVideos = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    
    const videos = await Video.find({ 
      featured: true, 
      isPublic: true 
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    
    res.json(videos);
  } catch (error: any) {
    console.error('Error fetching featured videos:', error);
    res.status(500).json({ message: 'Error fetching featured videos', error: error.message });
  }
};

// Get videos by category
export const getVideosByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = 12, page = 1 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const videos = await Video.find({ 
      category, 
      isPublic: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    
    const total = await Video.countDocuments({ category, isPublic: true });
    
    res.json({
      videos,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + videos.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching videos by category:', error);
    res.status(500).json({ message: 'Error fetching videos by category', error: error.message });
  }
};

// Search videos
export const searchVideos = async (req: Request, res: Response) => {
  try {
    const { q, category, limit = 20, page = 1 } = req.query;
    
    const filter: any = { isPublic: true };
    
    if (category) filter.category = category;
    
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q as string, 'i')] } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    
    const total = await Video.countDocuments(filter);
    
    res.json({
      videos,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + videos.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error: any) {
    console.error('Error searching videos:', error);
    res.status(500).json({ message: 'Error searching videos', error: error.message });
  }
}; 