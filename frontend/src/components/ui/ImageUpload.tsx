import React, { useState } from 'react';
import uploadService from '../../services/uploadService';

interface ImageUploadProps {
  initialImage?: string;
  onImageUpload: (imagePath: string) => void;
  placeholderText?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  initialImage = '',
  onImageUpload,
  placeholderText = 'Upload Image',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the selected image
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
    
    try {
      setError(null);
      setIsUploading(true);
      
      // Upload image to server (we'll choose either member or event upload based on caller)
      const uploadFn = async () => {
        try {
          // Since this is a generic component, the caller decides which upload function to use
          // by providing the appropriate callback
          const path = await uploadService.uploadMemberImage(file);
          onImageUpload(path);
          return path;
        } catch (error) {
          try {
            // Fallback to event upload if member upload fails
            const path = await uploadService.uploadEventImage(file);
            onImageUpload(path);
            return path;
          } catch (error) {
            throw error;
          }
        }
      };
      
      await uploadFn();
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const imageUrl = previewUrl || (initialImage ? uploadService.getImageUrl(initialImage) : '');
  
  return (
    <div className={`image-upload-container ${className}`}>
      <div className="mb-2 flex flex-col items-center">
        {imageUrl ? (
          <div className="relative mb-3 border border-gray-700 rounded overflow-hidden w-full max-w-xs">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-48 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/400x200/1A0033/00FFFF?text=IMAGE';
              }}
            />
          </div>
        ) : (
          <div className="w-full max-w-xs h-48 bg-dark-purple flex items-center justify-center border border-gray-700 rounded mb-3">
            <p className="text-gray-400">{placeholderText}</p>
          </div>
        )}
        
        <label className="cursor-pointer px-4 py-2 bg-neon-purple text-white rounded hover:bg-neon-pink transition duration-200">
          {isUploading ? 'Uploading...' : 'Choose Image'}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUpload; 