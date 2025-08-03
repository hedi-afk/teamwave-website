import React, { useState } from 'react';
import uploadService from '../services/uploadService';

const TestPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{path: string, url: string}>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setError(null);
      setIsUploading(true);
      
      // Upload as a member image
      const path = await uploadService.uploadMemberImage(selectedFile);
      console.log('Uploaded successfully, received path:', path);
      
      setImagePath(path);
      
      // Get the URL for display
      const url = uploadService.getImageUrl(path);
      console.log('Display URL:', url);
      
      setImageUrl(url);
      
      // Add to list of uploaded files
      setUploadedFiles(prev => [...prev, { path, url }]);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const directUrlTest = (path: string) => {
    // Try different URL patterns to see which works
    return [
      `http://localhost:5000/uploads/${path}`,
      `http://localhost:5000/uploads/images/${path.replace('images/', '')}`,
      `http://localhost:5000/${path}`
    ];
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Upload Test</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Upload an Image</h2>
        
        <div className="mb-4">
          <input 
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />
          
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {imagePath && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Upload Result:</h3>
            <p className="mb-2"><strong>Image Path:</strong> {imagePath}</p>
            <p className="mb-2"><strong>Image URL:</strong> {imageUrl}</p>
          </div>
        )}
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. Image Display Tests</h2>
          
          {uploadedFiles.map((file, index) => (
            <div key={index} className="mb-8 border-b border-gray-600 pb-8">
              <h3 className="font-medium mb-2">File #{index + 1}</h3>
              <p className="mb-2"><strong>Path:</strong> {file.path}</p>
              <p className="mb-2"><strong>URL:</strong> {file.url}</p>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Primary Display (using uploadService.getImageUrl):</h4>
                <div className="mb-6 bg-gray-900 p-4 rounded">
                  <img 
                    src={file.url} 
                    alt={`Uploaded ${index}`}
                    className="max-w-md max-h-64 object-contain mx-auto"
                    onError={(e) => {
                      console.error(`Image failed to load: ${file.url}`);
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x300/1A0033/00FFFF?text=LOAD+ERROR';
                    }}
                  />
                  <p className="text-gray-400 text-center mt-2 text-sm">Using: {file.url}</p>
                </div>
                
                <h4 className="font-medium mb-2">Alternative URLs to Try:</h4>
                {directUrlTest(file.path).map((testUrl, i) => (
                  <div key={i} className="mb-6 bg-gray-900 p-4 rounded">
                    <img 
                      src={testUrl} 
                      alt={`Test ${i}`}
                      className="max-w-md max-h-64 object-contain mx-auto"
                      onError={(e) => {
                        console.error(`Test image failed to load: ${testUrl}`);
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/400x300/660033/FFCCFF?text=FAILED';
                      }}
                    />
                    <p className="text-gray-400 text-center mt-2 text-sm">Using: {testUrl}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">3. Debugging Information</h2>
        <pre className="bg-gray-900 p-4 rounded text-xs overflow-auto">
          {JSON.stringify({
            uploadedFiles,
            imageBaseUrl: 'http://localhost:5000/uploads/',
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestPage; 