import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';
import uploadService from '../../services/uploadService';
import gameService from '../../services/gameService';

interface ImageUploadWithCropperProps {
  initialImage?: string;
  onImageUpload: (imagePath: string) => void;
  placeholderText?: string;
  className?: string;
  uploadType?: 'member' | 'event' | 'news' | 'game';
  aspectRatio?: number;
}

const ImageUploadWithCropper: React.FC<ImageUploadWithCropperProps> = ({
  initialImage = '',
  onImageUpload,
  placeholderText = 'Upload Image',
  className = '',
  uploadType = 'member',
  aspectRatio = 1
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const imageUrl = previewUrl || (initialImage ? uploadService.getImageUrl(initialImage) : '');
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }
    
    setError(null);
    setSelectedFile(file);
    
    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
      setShowCropper(true);
    };
    fileReader.readAsDataURL(file);
  };
  
  // Handle crop completion
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setIsUploading(true);
      setError(null);
      
      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], selectedFile?.name || 'cropped-image.jpg', {
        type: 'image/jpeg',
      });
      
      // Upload the cropped image
      let imagePath = '';
      switch (uploadType) {
        case 'member':
          imagePath = await uploadService.uploadMemberImage(croppedFile);
          break;
        case 'event':
          imagePath = await uploadService.uploadEventImage(croppedFile);
          break;
        case 'news':
          imagePath = await uploadService.uploadNewsImage(croppedFile);
          break;
        case 'game':
          imagePath = await uploadService.uploadGameImage(croppedFile);
          break;
      }
      
      onImageUpload(imagePath);
      setShowCropper(false);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle crop cancellation
  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    setPreviewUrl('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const fileReader = new FileReader();
        fileReader.onload = () => {
          setPreviewUrl(fileReader.result as string);
          setShowCropper(true);
        };
        fileReader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file.');
      }
    }
  };
  
  return (
    <>
      <div className={`image-upload-container ${className}`}>
        <div
          className={`relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center transition-colors duration-200 hover:border-neon-pink cursor-pointer ${
            isUploading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          
          {imageUrl ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto shadow-lg"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-400">
                Click to change image or drag a new one
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{placeholderText}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-2 text-red-400 text-sm">{error}</div>
        )}
      </div>
      
      {/* Image Cropper Modal */}
      {showCropper && previewUrl && (
        <ImageCropper
          imageSrc={previewUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
        />
      )}
    </>
  );
};

export default ImageUploadWithCropper; 