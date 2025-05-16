
import { useState, useEffect, useRef } from 'react';
import { getCachedLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';

// Define a consistent return type for the hook
export interface UseAppLogoResult {
  imageUrl: string;
  isLoading: boolean;
  error: boolean;
  iconUrl?: string;
  imageLoading?: boolean;
  imageError?: boolean;
  imageRef?: React.RefObject<HTMLImageElement>;
  handleImageError?: () => void;
  handleImageLoad?: () => void;
}

export const useAppLogo = (iconOrApp: string | AppData): UseAppLogoResult => {
  // Handle both string URLs and AppData objects
  const iconUrl = typeof iconOrApp === 'string' ? iconOrApp : (iconOrApp.icon || '');
  
  const [imageUrl, setImageUrl] = useState<string>(iconUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Alias properties for backward compatibility
  const imageLoading = isLoading;
  const imageError = error;
  
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
  
  // Handler functions
  const handleImageError = () => {
    setError(true);
    setIsLoading(false);
  };
  
  const handleImageLoad = () => {
    setError(false);
    setIsLoading(false);
  };
  
  // Return both old and new property names
  return { 
    imageUrl, 
    isLoading, 
    error,
    iconUrl: imageUrl,
    imageLoading,
    imageError,
    imageRef,
    handleImageError,
    handleImageLoad
  };
};

export default useAppLogo;
