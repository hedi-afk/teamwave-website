import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import videoService, { IVideo } from '../../services/videoService';
import VideoUpload from '../../components/ui/VideoUpload';
import { useAuth } from '../../context/AuthContext';

interface VideoFormData {
  title: string;
  description: string;
  thumbnail: string;
  thumbnailType: 'image' | 'video';
  videoFile: string;
  videoUrl: string;
  category: 'gameplay' | 'tournament' | 'interview' | 'highlights' | 'tutorial' | 'stream';
  duration: string;
  isPublic: boolean;
  featured: boolean;
  tags: string;
  uploadedBy: string;
}

const VideosPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{id: string, title: string} | null>(null);
  const [currentVideo, setCurrentVideo] = useState<IVideo | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Form state for adding/editing videos
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    thumbnail: '',
    thumbnailType: 'image',
    videoFile: '',
    videoUrl: '',
    category: 'gameplay',
    duration: '',
    isPublic: true,
    featured: false,
    tags: '',
    uploadedBy: 'Admin'
  });

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await videoService.getAllVideos();
        setVideos(response.videos);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please check the API connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleThumbnailUpload = (imagePath: string, thumbnailType: 'image' | 'video') => {
    console.log('handleThumbnailUpload called with:', { imagePath, thumbnailType });
    setFormData(prev => ({ ...prev, thumbnail: imagePath, thumbnailType }));
    setSuccess('Thumbnail uploaded successfully!');
  };

  const handleVideoUpload = (videoPath: string) => {
    setFormData(prev => ({ ...prev, videoFile: videoPath }));
    setSuccess('Video uploaded successfully!');
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Debug: Log current form state
      console.log('Form data before validation:', {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail,
        thumbnailType: formData.thumbnailType,
        videoFile: formData.videoFile,
        videoUrl: formData.videoUrl
      });
      
      // Validate form
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      
      if (!formData.thumbnail) {
        setError('Please upload a thumbnail (image or video) before submitting');
        return;
      }
      
      if (!formData.videoFile && !formData.videoUrl) {
        setError('Either video file or video URL must be provided');
        return;
      }

      const videoData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        uploadedBy: 'Admin'
      };

      const newVideo = await videoService.createVideo(videoData);
      setVideos(prev => [newVideo, ...prev]);
      setSuccess('Video created successfully!');
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating video:', err);
      setError(err.message || 'Failed to create video');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentVideo?._id) return;
    
    try {
      setLoading(true);
      
      const videoData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        duration: formData.duration ? parseInt(formData.duration) : undefined
      };

      const updatedVideo = await videoService.updateVideo(currentVideo._id, videoData);
      setVideos(prev => prev.map(video => 
        video._id === currentVideo._id ? updatedVideo : video
      ));
      setSuccess('Video updated successfully!');
      setShowEditModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error updating video:', err);
      setError(err.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteVideo = (id: string, title: string) => {
    setVideoToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    try {
      setLoading(true);
      await videoService.deleteVideo(videoToDelete.id);
      setVideos(prev => prev.filter(video => video._id !== videoToDelete.id));
      setSuccess('Video deleted successfully!');
      setShowDeleteModal(false);
      setVideoToDelete(null);
    } catch (err: any) {
      console.error('Error deleting video:', err);
      setError(err.message || 'Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const initEditForm = (video: IVideo) => {
    setCurrentVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      thumbnailType: video.thumbnailType || 'image',
      videoFile: video.videoFile || '',
      videoUrl: video.videoUrl || '',
      category: video.category,
      duration: video.duration?.toString() || '',
      isPublic: video.isPublic,
      featured: video.featured,
      tags: video.tags.join(', '),
      uploadedBy: video.uploadedBy
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      thumbnailType: 'image',
      videoFile: '',
      videoUrl: '',
      category: 'gameplay',
      duration: '',
      isPublic: true,
      featured: false,
      tags: '',
      uploadedBy: 'Admin'
    });
    setCurrentVideo(null);
  };

  const getThumbnailUrl = (thumbnail: string): string => {
    return videoService.getThumbnailUrl(thumbnail);
  };

  const getVideoUrl = (video: IVideo): string => {
    return videoService.getVideoUrl(video);
  };

  const filteredVideos = videos.filter(video => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'featured') return video.featured;
    if (activeFilter === 'public') return video.isPublic;
    return video.category === activeFilter;
  });

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-retro-black flex items-center justify-center">
        <div className="text-neon-purple text-2xl font-pixel">LOADING VIDEOS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-pixel text-white mb-2">Video Management</h1>
            <p className="text-gray-400">Manage your video content and uploads</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors font-arcade"
          >
            + Add Video
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6"
          >
            <p className="text-green-400">{success}</p>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'featured', 'public', 'gameplay', 'tournament', 'interview', 'highlights', 'tutorial', 'stream'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-arcade text-sm transition-colors ${
                activeFilter === filter
                  ? 'bg-neon-purple text-white'
                  : 'bg-dark-purple text-gray-300 hover:bg-dark-purple/80'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(video => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-purple rounded-lg overflow-hidden border border-gray-700 hover:border-neon-purple transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-800">
                {video.thumbnailType === 'video' ? (
                  <video
                    src={getThumbnailUrl(video.thumbnail)}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                      // Show fallback image
                      const fallbackImg = document.createElement('img');
                      fallbackImg.src = 'https://placehold.co/400x300/1A0033/FFFFFF?text=No+Thumbnail';
                      fallbackImg.className = 'w-full h-full object-cover';
                      target.parentNode?.appendChild(fallbackImg);
                    }}
                  />
                ) : (
                  <img
                    src={getThumbnailUrl(video.thumbnail)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x300/1A0033/FFFFFF?text=No+Thumbnail';
                    }}
                  />
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-arcade ${
                    video.featured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {video.featured ? 'FEATURED' : video.category.toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-arcade ${
                    video.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {video.isPublic ? 'PUBLIC' : 'PRIVATE'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-pixel text-white mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{videoService.formatViews(video.views)} views</span>
                  {video.duration && (
                    <span>{videoService.formatDuration(video.duration)}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => initEditForm(video)}
                    className="flex-1 px-3 py-2 bg-neon-blue text-white rounded text-sm hover:bg-neon-blue/80 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDeleteVideo(video._id!, video.title)}
                    className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVideos.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No videos found</p>
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-dark-purple w-full max-w-2xl rounded-lg shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-pixel text-white mb-6">Add New Video</h2>
              
              <form onSubmit={handleAddVideo} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    >
                      <option value="gameplay">Gameplay</option>
                      <option value="tournament">Tournament</option>
                      <option value="interview">Interview</option>
                      <option value="highlights">Highlights</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="stream">Stream</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    required
                  />
                </div>

                {/* Video Upload */}
                <VideoUpload
                  onThumbnailUpload={handleThumbnailUpload}
                  onVideoUpload={handleVideoUpload}
                  onError={handleUploadError}
                  thumbnailPath={formData.thumbnail}
                  videoPath={formData.videoFile}
                />

                {/* External Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    External Video URL (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Use this if you don't want to upload a video file
                  </p>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (seconds)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="120"
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="gaming, esports, highlights"
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Public</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Featured</span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-neon-purple text-white rounded hover:bg-neon-purple/80 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Video'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditModal && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-dark-purple w-full max-w-2xl rounded-lg shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-pixel text-white mb-6">Edit Video</h2>
              
              <form onSubmit={handleEditVideo} className="space-y-6">
                {/* Same form fields as Add Modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    >
                      <option value="gameplay">Gameplay</option>
                      <option value="tournament">Tournament</option>
                      <option value="interview">Interview</option>
                      <option value="highlights">Highlights</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="stream">Stream</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    required
                  />
                </div>

                {/* Video Upload */}
                <VideoUpload
                  onThumbnailUpload={handleThumbnailUpload}
                  onVideoUpload={handleVideoUpload}
                  onError={handleUploadError}
                  thumbnailPath={formData.thumbnail}
                  videoPath={formData.videoFile}
                />

                {/* External Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    External Video URL (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                  />
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (seconds)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="120"
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="gaming, esports, highlights"
                      className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Public</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Featured</span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-neon-blue text-white rounded hover:bg-neon-blue/80 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Video'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-dark-purple w-full max-w-md rounded-lg shadow-lg overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-pixel text-white mb-4">Delete Video</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{videoToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVideo}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideosPage; 