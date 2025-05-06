
import { useState, useEffect, useRef } from 'react';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';
import { 
  isIOSOrMacOS,
  storeSuccessfulIcon,
  handleImageLoadError,
  preloadImageForIOSMacOS,
  checkImagePreloaded,
  isSafariBrowser
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
  const maxRetries = isIOSOrMacOS() ? 7 : 3; // Even more retries for Safari
  const isSafari = isSafariBrowser();
  const imageRef = useRef<HTMLImageElement>(null);
  const [iconUrl, setIconUrl] = useState<string>(getCachedLogo(app, isSafari));
  
  // On mount, check if the image is already in cache
  useEffect(() => {
    // Get logo from cache service with Safari flag
    const cachedLogo = getCachedLogo(app, isSafari);
    setIconUrl(cachedLogo);
    
    // Specific handling for Safari browsers
    if (isSafari) {
      const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      
      // Try multiple reliable sources for Safari in sequence
      const tryNextSource = (sourceIndex = 0) => {
        const sources = [
          cachedLogo,
          `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          `https://icon.horse/icon/${domain}?size=large`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
          `https://logo.clearbit.com/${domain}`,
          `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${app.url}&size=128`
        ];
        
        if (sourceIndex >= sources.length) {
          // We've tried all sources, set loading to false
          setImageLoading(false);
          return;
        }
        
        const currentSource = sources[sourceIndex];
        preloadImageForIOSMacOS(
          currentSource,
          () => {
            // Success with this source
            setIconUrl(currentSource);
            setImageLoading(false);
            storeSuccessfulIcon(app, currentSource, false);
            registerSuccessfulLogo(app.id, currentSource, domain);
          },
          () => {
            // Try the next source
            tryNextSource(sourceIndex + 1);
          }
        );
      };
      
      // Start trying sources
      tryNextSource();
    } else {
      // Non-Safari browsers - use standard approach
      preloadImageForIOSMacOS(
        cachedLogo,
        () => {
          setImageLoading(false);
          storeSuccessfulIcon(app, cachedLogo, imageError);
        },
        () => {
          // Try Google Favicon as a fallback
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
      storeSuccessfulIcon(app, iconUrl, imageError);
    });
  }, [app.id]);
  
  // Function to handle image error
  const handleImageError = () => {
    if (isSafari) {
      // Special error handling for Safari
      const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      
      // Choose from reliable sources for Safari
      const fallbacks = [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://icon.horse/icon/${domain}?size=large`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://logo.clearbit.com/${domain}`
      ];
      
      // Use the retry count to cycle through fallbacks
      const fallbackIndex = retryCount % fallbacks.length;
      setRetryCount(retryCount + 1);
      const newUrl = fallbacks[fallbackIndex];
      setIconUrl(newUrl);
      
      // Register successful icon even during retries to improve future loads
      if (retryCount > 1) {
        registerSuccessfulLogo(app.id, newUrl, domain);
      }
      
      return;
    }
    
    // Standard error handling for other browsers
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
    
    // Also register in the cache service
    const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
    registerSuccessfulLogo(app.id, iconUrl, domain);
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
