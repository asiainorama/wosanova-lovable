
import { useState, useEffect, useRef } from 'react';
import { getCachedLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';
import { 
  isIOSOrMacOS,
  storeSuccessfulIcon,
  handleImageLoadError,
  preloadImageForIOSMacOS,
  checkImagePreloaded
} from './iconLoading';

interface UseAppLogoResult {
  iconUrl: string;
  imageLoading: boolean;
  imageError: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  handleImageError: () => void;
  handleImageLoad: () => void;
}

/**
 * Hook to handle app logo loading, caching, and fallbacks
 */
export const useAppLogo = (app: AppData): UseAppLogoResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = isIOSOrMacOS() ? 5 : 3; // Increased retries for iOS/macOS
  const imageRef = useRef<HTMLImageElement>(null);
  const [iconUrl, setIconUrl] = useState<string>(getCachedLogo(app));
  
  // On mount, check if the image is already in cache
  useEffect(() => {
    // Get logo from cache service
    const cachedLogo = getCachedLogo(app);
    setIconUrl(cachedLogo);
    
    // Preload icons for iOS/macOS
    if (isIOSOrMacOS()) {
      preloadImageForIOSMacOS(
        cachedLogo,
        () => {
          setImageLoading(false);
          storeSuccessfulIcon(app, cachedLogo, imageError);
        },
        () => {
          // Try Google Favicon as a first fallback for Safari
          const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
          const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
          
          setIconUrl(fallbackUrl);
          preloadImageForIOSMacOS(
            fallbackUrl,
            () => {
              setImageLoading(false);
              storeSuccessfulIcon(app, fallbackUrl, false);
            },
            handleImageError
          );
        }
      );
    }
    
    // Check if image is already loaded from cache
    checkImagePreloaded(imageRef, () => {
      setImageLoading(false);
      storeSuccessfulIcon(app, cachedLogo, imageError);
    });
  }, [app.id]);
  
  // Function to handle image error
  const handleImageError = () => {
    handleImageLoadError(
      app,
      iconUrl,
      retryCount,
      maxRetries,
      imageRef,
      (newUrl) => {
        setRetryCount(retryCount + 1);
        setIconUrl(newUrl);
      },
      () => {
        setImageError(true);
        setImageLoading(false);
      }
    );
  };

  // Function to handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    storeSuccessfulIcon(app, iconUrl, false);
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

export default useAppLogo;
