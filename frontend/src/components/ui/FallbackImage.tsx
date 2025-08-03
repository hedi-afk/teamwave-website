import React, { useState, useEffect } from 'react';
import config from '../../config';
import uploadService from '../../services/uploadService';
import NewsPlaceholder from './NewsPlaceholder';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  category?: 'announcement' | 'event' | 'team' | 'community' | 'partnership';
}

const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/api/direct-test-image',
  category = 'announcement'
}) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  useEffect(() => {
    // Process the src URL at component mount and when src changes
    
    // Case 1: Empty or undefined src
    if (!src) {
      console.warn('Empty image path, using placeholder');
      setError(true);
      return;
    }
    
    // Case 2: Special placeholder identifier
    if (src === 'placeholder://test-image' || src === 'test-image.jpg') {
      console.log('Using placeholder for test image');
      setError(true);
      return;
    }
    
    // Case 3: Regular image to display
    setImageSrc(src);
    setError(false);
    
  }, [src]);
  
  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    console.error('Original src:', src);
    
    // If not already using the placeholder, use it now
    if (!error) {
      console.log('Image load failed, using styled placeholder');
      setError(true);
    }
  };

  // For images that fail to load or are set to error, show the placeholder
  if (error) {
    return <NewsPlaceholder category={category} className={className} />;
  }

  // Otherwise show the actual image
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default FallbackImage; 