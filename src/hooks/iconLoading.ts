
import { RefObject } from 'react';
import { AppData } from '@/data/apps';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';

/**
 * Determines if the current device is iOS or macOS with improved detection
 */
export const isIOSOrMacOS = (): boolean => {
  const userAgent = navigator.userAgent;
  
  // More comprehensive check for iOS and macOS
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isMacOS = /Mac OS X/.test(userAgent) && !(/iPad|iPhone|iPod/.test(userAgent));
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  
  return isIOS || isMacOS || isSafari;
};

/**
 * Specifically checks if the browser is Safari
 */
export const isSafariBrowser = (): boolean => {
  const userAgent = navigator.userAgent;
  // More accurate Safari detection
  return /^((?!chrome|android).)*safari/i.test(userAgent);
};

/**
 * Store icon URL when successfully loaded
 */
export const storeSuccessfulIcon = (app: AppData, iconUrl: string, hasError: boolean): void => {
  if (app.url && !hasError && iconUrl && !iconUrl.includes('placeholder')) {
    try {
      // Extract domain from the app URL
      const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      registerSuccessfulLogo(app.id, iconUrl, domain);
    } catch (e) {
      console.warn('Failed to register successful icon:', e);
    }
  }
};

/**
 * Handle image loading error by trying different strategies
 */
export const handleImageLoadError = (
  app: AppData,
  iconUrl: string,
  retryCount: number,
  maxRetries: number,
  imageRef: RefObject<HTMLImageElement>,
  onRetry: (newUrl: string) => void,
  onError: () => void
): void => {
  // If we've already retried too many times, show fallback
  if (retryCount >= maxRetries) {
    onError();
    return;
  }

  const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
  
  // Try different image strategies based on retry count
  switch (retryCount) {
    case 0:
      // First retry: add a cache buster
      const timestamp = new Date().getTime();
      const newUrl = iconUrl.split('?')[0] + '?' + timestamp;
      onRetry(newUrl);
      if (imageRef.current) {
        imageRef.current.src = newUrl;
      }
      break;
      
    case 1:
      // Second retry: try Google Favicon API as a fallback
      const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      onRetry(googleUrl);
      if (imageRef.current) {
        imageRef.current.src = googleUrl;
      }
      break;
      
    case 2:
      // Third retry: try DuckDuckGo favicon service (often works well with Safari)
      const ddgUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      onRetry(ddgUrl);
      if (imageRef.current) {
        imageRef.current.src = ddgUrl;
      }
      break;
      
    case 3:
      // Fourth retry: try another favicon service
      const faviconKitUrl = `https://api.faviconkit.com/${domain}/128`;
      onRetry(faviconKitUrl);
      if (imageRef.current) {
        imageRef.current.src = faviconKitUrl;
      }
      break;
      
    case 4:
      // Fifth retry: try Clearbit API (often has high quality logos)
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      onRetry(clearbitUrl);
      if (imageRef.current) {
        imageRef.current.src = clearbitUrl;
      }
      break;
    
    case 5:
      // Sixth retry: try Google's t3 favicon service
      const googleT3Url = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${app.url}&size=128`;
      onRetry(googleT3Url);
      if (imageRef.current) {
        imageRef.current.src = googleT3Url;
      }
      break;
      
    case 6:
      // Seventh retry: try Icon Horse (good for Safari)
      const iconHorseUrl = `https://icon.horse/icon/${domain}?size=large`;
      onRetry(iconHorseUrl);
      if (imageRef.current) {
        imageRef.current.src = iconHorseUrl;
      }
      break;
      
    default:
      // If all retries failed, show fallback
      onError();
      break;
  }
};

/**
 * Preload an image for iOS/macOS devices with improved handling
 */
export const preloadImageForIOSMacOS = (
  url: string, 
  onSuccess: () => void, 
  onError: () => void
): void => {
  if (!url) {
    onError();
    return;
  }
  
  // For Safari we always preload, not just for iOS/macOS
  if (!isIOSOrMacOS() && !isSafariBrowser()) return;
  
  const img = new Image();
  
  // Set a timeout to avoid hanging if the image load takes too long
  const timeout = setTimeout(() => {
    img.src = '';
    onError();
  }, 3000); // Reduced timeout for better UX
  
  img.onload = () => {
    clearTimeout(timeout);
    // Verify image has actual dimensions before marking as success
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      onSuccess();
    } else {
      onError();
    }
  };
  
  img.onerror = () => {
    clearTimeout(timeout);
    onError();
  };
  
  // Set crossOrigin to allow CORS for some favicon sources
  img.crossOrigin = "anonymous";
  img.src = url;
};

/**
 * Check if an image is already loaded from cache
 */
export const checkImagePreloaded = (
  imageRef: RefObject<HTMLImageElement>,
  onLoaded: () => void
): void => {
  if (imageRef.current?.complete && imageRef.current?.naturalWidth > 0) {
    onLoaded();
  }
};
