
import { useState, useEffect, useRef } from 'react';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';

interface UseAppLogoResult {
  iconUrl: string;
  imageLoading: boolean;
  imageError: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  handleImageError: () => void;
  handleImageLoad: () => void;
}

export const useAppLogo = (app: AppData): UseAppLogoResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const imageRef = useRef<HTMLImageElement>(null);
  const [iconUrl, setIconUrl] = useState<string>(getCachedLogo(app));
  
  // Store icon URL when successfully loaded
  const storeSuccessfulIcon = () => {
    if (app.url && !imageError && iconUrl && !iconUrl.includes('placeholder')) {
      try {
        // Extract domain from the app URL
        const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
        registerSuccessfulLogo(app.id, iconUrl, domain);
      } catch (e) {
        console.warn('Failed to register successful icon:', e);
      }
    }
  };
  
  // On mount, check if the image is already in cache
  useEffect(() => {
    // Get logo from cache service
    const cachedLogo = getCachedLogo(app);
    setIconUrl(cachedLogo);
    
    if (cachedLogo && imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        // Image is already loaded (likely from cache)
        setImageLoading(false);
        storeSuccessfulIcon();
      }
    }
  }, [app.id]);
  
  // Function to handle image error
  const handleImageError = () => {
    // If we've already retried too many times, show fallback
    if (retryCount >= maxRetries) {
      setImageError(true);
      setImageLoading(false);
      return;
    }
    
    setRetryCount(retryCount + 1);
    
    // Try different image strategies based on retry count
    if (retryCount === 0) {
      // First retry: add a cache buster
      const timestamp = new Date().getTime();
      const newUrl = iconUrl.split('?')[0] + '?' + timestamp;
      setIconUrl(newUrl);
      if (imageRef.current) {
        imageRef.current.src = newUrl;
      }
    } 
    else if (retryCount === 1) {
      // Second retry: try Google Favicon API as a fallback
      const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      const newUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      setIconUrl(newUrl);
      if (imageRef.current) {
        imageRef.current.src = newUrl;
      }
    }
    else {
      // If all retries failed, show fallback
      setImageError(true);
      setImageLoading(false);
    }
  };

  // Function to handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    storeSuccessfulIcon();
  };
  
  return {
    iconUrl,
    imageLoading,
    imageError,
    imageRef,
    handleImageError,
    handleImageLoad
  };
};
