import axios from 'axios';
import config from '../config';

// Create a module-level URL cache
const imageUrlCache: Record<string, string> = {};

/**
 * Service for handling file uploads
 */
const uploadService = {
  /**
   * Upload an image for a member
   * @param file - The file to upload
   * @returns The path to the uploaded image
   */
  uploadMemberImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading member image to:', `${config.apiUrl}/members/upload`);
      
      const response = await axios.post(`${config.apiUrl}/members/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      return response.data.imagePath;
    } catch (error) {
      console.error('Error uploading member image:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
      }
      throw error;
    }
  },
  
  /**
   * Upload an image for an event
   * @param file - The file to upload
   * @returns The path to the uploaded image
   */
  uploadEventImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading event image to:', `${config.apiUrl}/events/upload`);
      
      const response = await axios.post(`${config.apiUrl}/events/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      return response.data.imagePath;
    } catch (error) {
      console.error('Error uploading event image:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
      }
      throw error;
    }
  },

  /**
   * Upload an image for a news article
   * @param file - The file to upload
   * @returns The path to the uploaded image
   */
  uploadNewsImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading news image to:', `${config.apiUrl}/news/upload`);
      console.log('File being uploaded:', file.name, file.type, file.size);
      
      // Add a timeout to prevent infinite waiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await axios.post(`${config.apiUrl}/news/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.log('Upload response:', response.data);
      
      if (!response.data || !response.data.imagePath) {
        console.error('Invalid response from server: Missing imagePath');
        
        // Use test-image.jpg as fallback if the server doesn't provide a path
        if (process.env.NODE_ENV !== 'production') {
          console.log('Using test-image.jpg as fallback');
          return 'test-image.jpg';
        }
        
        throw new Error('Invalid response from server: Missing imagePath');
      }
      
      return response.data.imagePath;
    } catch (error) {
      console.error('Error uploading news image:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        
        // Provide more specific error message based on response
        if (error.response?.status === 413) {
          throw new Error('File is too large. Please select a smaller image.');
        } else if (error.response?.status === 415) {
          throw new Error('Invalid file type. Please use JPG, PNG, or WebP images.');
        } else if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          console.warn('Request timed out, using fallback image');
          return 'test-image.jpg';
        }
      }
      
      // For development, use fallback image instead of failing
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using fallback image due to upload error');
        return 'test-image.jpg';
      }
      
      throw error;
    }
  },
  
  /**
   * Upload an image for a game
   * @param file - The file to upload
   * @returns The path to the uploaded image
   */
  uploadGameImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading game image to:', `${config.apiUrl}/games/upload`);
      
      const response = await axios.post(`${config.apiUrl}/games/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      return response.data.imagePath;
    } catch (error) {
      console.error('Error uploading game image:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
      }
      throw error;
    }
  },
  
  /**
   * Upload an image for a partner/sponsor
   * @param file - The file to upload
   * @returns The path to the uploaded image
   */
  uploadPartnerImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading partner image to:', `${config.apiUrl}/partners/upload`);
      console.log('File being uploaded:', file.name, file.type, file.size);
      
      // Add a timeout to prevent infinite waiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await axios.post(`${config.apiUrl}/partners/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.log('Upload response:', response.data);
      
      if (!response.data || !response.data.imagePath) {
        console.error('Invalid response from server: Missing imagePath');
        
        // Use test-image.jpg as fallback if the server doesn't provide a path
        if (process.env.NODE_ENV !== 'production') {
          console.log('Using test-image.jpg as fallback');
          return 'test-image.jpg';
        }
        
        throw new Error('Invalid response from server: Missing imagePath');
      }
      
      return response.data.imagePath;
    } catch (error) {
      console.error('Error uploading partner image:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        
        // Provide more specific error message based on response
        if (error.response?.status === 413) {
          throw new Error('File is too large. Please select a smaller image.');
        } else if (error.response?.status === 415) {
          throw new Error('Invalid file type. Please use JPG, PNG, or WebP images.');
        } else if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          console.warn('Request timed out, using fallback image');
          return 'test-image.jpg';
        }
      }
      
      // For development, use fallback image instead of failing
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using fallback image due to upload error');
        return 'test-image.jpg';
      }
      
      throw error;
    }
  },
  
  /**
   * Get the full URL for an image path
   * @param imagePath - The relative path to the image
   * @returns The full URL to the image
   */
  getImageUrl: (imagePath: string): string => {
    // Handle empty or invalid paths
    if (!imagePath || typeof imagePath !== 'string') {
      console.warn('Invalid image path provided:', imagePath);
      throw new Error('Invalid image path');
    }
    
    // Check cache first
    if (imageUrlCache[imagePath]) {
      return imageUrlCache[imagePath];
    }
    
    // If it's already an external URL (contains http:// or https://)
    if (imagePath.match(/^https?:\/\//)) {
      imageUrlCache[imagePath] = imagePath;
      return imagePath;
    }
    
    // Special handling for test-image.jpg
    if (imagePath === 'test-image.jpg') {
      // Return a special identifier that will trigger our placeholder
      const placeholder = 'placeholder://test-image';
      imageUrlCache[imagePath] = placeholder;
      return placeholder;
    }
    
    try {
      // Remove any leading slashes
      const cleanPath = imagePath.replace(/^\/+/, '');
      
      // Get absolute path for debugging
      console.log(`Building URL for image: ${cleanPath}`);
      
      let fullUrl: string;
      
      // Fix for partner/sponsor logos that were incorrectly saved to news/ directory
      // Check if this is a full path like "uploads/news/filename.jpg" and redirect to partners
      if (cleanPath.startsWith('uploads/news/')) {
        const filename = cleanPath.replace('uploads/news/', '');
        fullUrl = `${config.imageBaseUrl}partners/${filename}`;
        console.log(`Redirecting partner/sponsor logo from news to partners: ${fullUrl}`);
      }
      // Handle paths that already start with "uploads/" - just prepend the base URL
      else if (cleanPath.startsWith('uploads/')) {
        // Remove the 'uploads/' prefix since config.imageBaseUrl already includes it
        const pathWithoutUploads = cleanPath.replace(/^uploads\//, '');
        fullUrl = `${config.imageBaseUrl}${pathWithoutUploads}`;
        console.log(`Generated image URL: ${fullUrl} (uploads path)`);
      }
      // News images should be in the news/ directory
      else if (cleanPath.startsWith('news/')) {
        fullUrl = `${config.imageBaseUrl}${cleanPath}`;
        console.log(`Generated image URL: ${fullUrl} (news path)`);
      } 
      // Partner images should be in the partners/ directory
      else if (cleanPath.startsWith('partners/')) {
        fullUrl = `${config.imageBaseUrl}${cleanPath}`;
        console.log(`Generated image URL: ${fullUrl} (partners path)`);
      }
      // Game images should be in the images/ directory
      else if (cleanPath.startsWith('images/')) {
        fullUrl = `${config.imageBaseUrl}${cleanPath}`;
        console.log(`Generated image URL: ${fullUrl} (game path)`);
      }
      // For backwards compatibility, handle images directly in uploads
      else if (!cleanPath.includes('/')) {
        // If it's just a filename, assume it's in news/ directory
        fullUrl = `${config.imageBaseUrl}news/${cleanPath}`;
        console.log(`Generated image URL: ${fullUrl} (root path)`);
      } 
      // General case - just prepend the base URL
      else {
        fullUrl = `${config.imageBaseUrl}${cleanPath}`;
        console.log(`Generated image URL: ${fullUrl} (general case)`);
      }
      
      // Cache the result
      imageUrlCache[imagePath] = fullUrl;
      return fullUrl;
    } catch (error) {
      console.error('Error processing image URL:', error);
      console.error('Original image path:', imagePath);
      throw new Error(`Failed to process image URL: ${imagePath}`);
    }
  },
  
  // Add a method to clear the cache if needed
  clearImageUrlCache: () => {
    Object.keys(imageUrlCache).forEach(key => {
      delete imageUrlCache[key];
    });
    console.log('Image URL cache cleared');
  }
};

export default uploadService; 