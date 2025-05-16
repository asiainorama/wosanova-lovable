
import { useState, useEffect } from 'react';
import { getCachedLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';

export const useAppLogo = (iconUrl: string) => {
  const [imageUrl, setImageUrl] = useState<string>(iconUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    // Set loading state initially
    setIsLoading(true);
    setError(false);
    
    // Create an image object to check if the image loads
    const img = new Image();
    
    img.onload = () => {
      setImageUrl(iconUrl);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    
    img.src = iconUrl;
    
    // If image is already cached and loaded instantly
    if (img.complete) {
      setIsLoading(false);
    }
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [iconUrl]);
  
  return { imageUrl, isLoading, error };
};

export default useAppLogo;
