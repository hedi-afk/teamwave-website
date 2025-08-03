import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import videoService from '../../services/videoService';

interface VideoUploadProps {
  onThumbnailUpload: (imagePath: string, thumbnailType: 'image' | 'video') => void;
  onVideoUpload: (videoPath: string) => void;
  onError: (error: string) => void;
  thumbnailPath?: string;
  videoPath?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onThumbnailUpload,
  onVideoUpload,
  onError,
  thumbnailPath,
  videoPath
}) => {
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Thumbnail upload - File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    });

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      console.log('File type validation failed:', file.type);
      onError('Please select an image or video file for the thumbnail');
      return;
    }

    // Validate file size (50MB limit for video thumbnails)
    if (file.size > 50 * 1024 * 1024) {
      onError('Thumbnail file size must be less than 50MB');
      return;
    }

    try {
      setThumbnailUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await videoService.uploadThumbnail(file);
      
      if (response.success && response.imagePath) {
        onThumbnailUpload(response.imagePath, response.thumbnailType || 'image');
      } else {
        throw new Error(response.message || 'Failed to upload thumbnail');
      }
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      onError(error.message || 'Failed to upload thumbnail');
      setThumbnailPreview('');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      onError('Please select a video file');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      onError('Video file size must be less than 100MB');
      return;
    }

    try {
      setVideoUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await videoService.uploadVideoFile(file);
      
      if (response.success && response.videoPath) {
        onVideoUpload(response.videoPath);
      } else {
        throw new Error(response.message || 'Failed to upload video');
      }
    } catch (error: any) {
      console.error('Error uploading video:', error);
      onError(error.message || 'Failed to upload video');
      setVideoPreview('');
    } finally {
      setVideoUploading(false);
    }
  };

  const triggerThumbnailUpload = () => {
    thumbnailInputRef.current?.click();
  };

  const triggerVideoUpload = () => {
    videoInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Thumbnail Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Video Thumbnail (Image or Video)
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {(thumbnailPreview || thumbnailPath) && (
              <div className="w-32 h-20 bg-dark-purple rounded-lg overflow-hidden border border-gray-700">
                {thumbnailPreview && thumbnailPreview.startsWith('data:video') ? (
                  <video
                    src={thumbnailPreview}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                  />
                ) : (
                  <img
                    src={thumbnailPreview || (thumbnailPath ? videoService.getThumbnailUrl(thumbnailPath) : '')}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={triggerThumbnailUpload}
              disabled={thumbnailUploading}
              className="w-full px-4 py-2 bg-neon-purple text-white rounded hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {thumbnailUploading ? 'Uploading...' : 'Upload Thumbnail'}
            </button>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, GIF, MP4, MOV, AVI up to 5MB
            </p>
          </div>
        </div>
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleThumbnailUpload}
          className="hidden"
        />
      </div>

      {/* Video Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Video File (Optional - you can also use external URL)
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {videoPreview && (
              <div className="w-32 h-20 bg-dark-purple rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                <video
                  src={videoPreview}
                  className="w-full h-full object-cover"
                  muted
                />
              </div>
            )}
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={triggerVideoUpload}
              disabled={videoUploading}
              className="w-full px-4 py-2 bg-neon-green text-white rounded hover:bg-neon-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {videoUploading ? 'Uploading...' : 'Upload Video File'}
            </button>
            <p className="text-xs text-gray-400 mt-1">
              MP4, AVI, MOV up to 100MB
            </p>
          </div>
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {(thumbnailUploading || videoUploading) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-purple/50 rounded-lg p-4 border border-neon-purple/30"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-neon-purple"></div>
            <span className="text-sm text-gray-300">
              {thumbnailUploading ? 'Uploading thumbnail...' : 'Uploading video...'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VideoUpload; 