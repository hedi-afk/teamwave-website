import React, { useState, useRef } from 'react';
import uploadService from '../../services/uploadService';

interface ImageUploaderProps {
  onImageUpload: (imagePath: string) => void;
  existingImage?: string;
  uploadType: 'member' | 'event' | 'news';
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  existingImage = '',
  uploadType,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(existingImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Upload the image
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      let imagePath = '';
      
      // Call the appropriate upload function based on type
      switch (uploadType) {
        case 'member':
          imagePath = await uploadService.uploadMemberImage(file);
          break;
        case 'event':
          imagePath = await uploadService.uploadEventImage(file);
          break;
        case 'news':
          imagePath = await uploadService.uploadNewsImage(file);
          break;
      }
      
      onImageUpload(imagePath);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error(`Error uploading ${uploadType} image:`, error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Preview the dropped image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
    
    // Upload the image
    handleUpload(file);
  };

  // Get the display URL for the image
  const displayUrl = previewUrl || 
    (existingImage ? uploadService.getImageUrl(existingImage) : '');
  
  // Create a fallback error handler for image loading failures
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load image:', e);
    // Set a fallback placeholder image
    e.currentTarget.src = `https://placehold.co/600x400/1A0033/${uploadType === 'member' ? 'FF00FF' : uploadType === 'news' ? '00FFFF' : 'FFFF00'}?text=${uploadType.toUpperCase()}`;
  };

  return (
    <div className={`${className}`}>
      <div
        className={`border-2 border-dashed border-neon-purple/30 rounded-lg overflow-hidden transition-all
          ${isUploading ? 'opacity-50' : 'hover:border-neon-purple cursor-pointer'}
          ${uploadError ? 'border-red-500' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          <div className="relative group">
            <img
              src={displayUrl}
              alt="Upload preview"
              className="w-full h-48 object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-dark-purple/70 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-medium">Click to change image</span>
            </div>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center p-4 bg-dark-purple">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-neon-purple/50 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-center text-white text-sm">
              {isUploading 
                ? 'Uploading...' 
                : 'Click to upload or drag an image here'}
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-red-500 text-xs mt-1">{uploadError}</p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default ImageUploader; 