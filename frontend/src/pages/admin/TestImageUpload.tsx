import React, { useState } from 'react';
import ImageUpload from '../../components/ui/ImageUpload';
import uploadService from '../../services/uploadService';

const TestImageUpload: React.FC = () => {
  const [imagePath, setImagePath] = useState<string>('');
  const [displayUrl, setDisplayUrl] = useState<string>('');
  
  const handleImageUpload = (path: string) => {
    console.log('Image uploaded, path received:', path);
    setImagePath(path);
    
    // Calculate display URL
    const url = uploadService.getImageUrl(path);
    console.log('Calculated display URL:', url);
    setDisplayUrl(url);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Test Image Upload</h1>
      
      <div className="mb-8 p-6 bg-dark-purple rounded-lg">
        <h2 className="text-xl font-semibold text-neon-blue mb-4">Upload Test</h2>
        
        <div className="mb-6">
          <ImageUpload
            initialImage=""
            onImageUpload={handleImageUpload}
            placeholderText="Test Upload"
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium text-white mb-2">Raw Image Path:</h3>
          <pre className="bg-gray-800 p-3 rounded text-gray-300 overflow-x-auto">
            {imagePath || 'No image uploaded yet'}
          </pre>
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium text-white mb-2">Display URL:</h3>
          <pre className="bg-gray-800 p-3 rounded text-gray-300 overflow-x-auto">
            {displayUrl || 'No URL generated yet'}
          </pre>
        </div>
      </div>
      
      {displayUrl && (
        <div className="p-6 bg-dark-purple rounded-lg">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">Image Preview</h2>
          
          <div className="border border-gray-700 rounded overflow-hidden max-w-lg mx-auto">
            <img 
              src={displayUrl} 
              alt="Uploaded" 
              className="w-full h-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('Image failed to load:', displayUrl);
                target.src = 'https://placehold.co/400x300/1A0033/00FFFF?text=IMAGE+LOAD+ERROR';
              }}
            />
          </div>
          
          <div className="mt-4 text-gray-400 text-center">
            <p>If the image doesn't appear above, there might be an issue with the URL construction or server configuration.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestImageUpload; 