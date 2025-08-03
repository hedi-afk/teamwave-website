import axios from 'axios';
import config from '../config';

export interface IVideo {
  _id?: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailType: 'image' | 'video';
  videoFile?: string;
  videoUrl?: string;
  category: 'gameplay' | 'tournament' | 'interview' | 'highlights' | 'tutorial' | 'stream';
  duration?: number;
  views: number;
  isPublic: boolean;
  featured: boolean;
  tags: string[];
  uploadedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VideoUploadResponse {
  message: string;
  imagePath?: string;
  videoPath?: string;
  thumbnailType?: 'image' | 'video';
  success: boolean;
}

export interface VideoListResponse {
  videos: IVideo[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const videoService = {
  /**
   * Get all videos with optional filtering
   */
  getAllVideos: async (params?: {
    category?: string;
    featured?: boolean;
    isPublic?: boolean;
    limit?: number;
    page?: number;
  }): Promise<VideoListResponse> => {
    try {
      const response = await axios.get(`${config.apiUrl}/videos`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  /**
   * Get a single video by ID
   */
  getVideoById: async (id: string): Promise<IVideo> => {
    try {
      const response = await axios.get(`${config.apiUrl}/videos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching video with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured videos
   */
  getFeaturedVideos: async (limit: number = 6): Promise<IVideo[]> => {
    try {
      const response = await axios.get(`${config.apiUrl}/videos/featured`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured videos:', error);
      throw error;
    }
  },

  /**
   * Get videos by category
   */
  getVideosByCategory: async (
    category: string,
    limit: number = 12,
    page: number = 1
  ): Promise<VideoListResponse> => {
    try {
      const response = await axios.get(`${config.apiUrl}/videos/category/${category}`, {
        params: { limit, page }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching videos for category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Search videos
   */
  searchVideos: async (params: {
    q?: string;
    category?: string;
    limit?: number;
    page?: number;
  }): Promise<VideoListResponse> => {
    try {
      const response = await axios.get(`${config.apiUrl}/videos/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  },

  /**
   * Create a new video
   */
  createVideo: async (videoData: Partial<IVideo>): Promise<IVideo> => {
    try {
      const response = await axios.post(`${config.apiUrl}/videos`, videoData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data.video;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  /**
   * Update an existing video
   */
  updateVideo: async (id: string, videoData: Partial<IVideo>): Promise<IVideo> => {
    try {
      const response = await axios.put(`${config.apiUrl}/videos/${id}`, videoData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data.video;
    } catch (error) {
      console.error(`Error updating video with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a video
   */
  deleteVideo: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${config.apiUrl}/videos/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
    } catch (error) {
      console.error(`Error deleting video with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Upload video thumbnail
   */
  uploadThumbnail: async (file: File): Promise<VideoUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await axios.post(`${config.apiUrl}/videos/upload/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw error;
    }
  },

  /**
   * Upload video file
   */
  uploadVideoFile: async (file: File): Promise<VideoUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await axios.post(`${config.apiUrl}/videos/upload/video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading video file:', error);
      throw error;
    }
  },

  /**
   * Get video URL (either from file or external URL)
   */
  getVideoUrl: (video: IVideo): string => {
    if (video.videoFile) {
      return `${config.imageBaseUrl}${video.videoFile}`;
    }
    return video.videoUrl || '';
  },

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl: (thumbnail: string): string => {
    // If thumbnail already includes the full path, use it as is
    if (thumbnail.startsWith('http')) {
      return thumbnail;
    }
    // Otherwise, construct the full URL using imageBaseUrl (without /api)
    return `${config.imageBaseUrl}${thumbnail}`;
  },

  /**
   * Format video duration
   */
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * Format view count
   */
  formatViews: (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }
};

export default videoService; 