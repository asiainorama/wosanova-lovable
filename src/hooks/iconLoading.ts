
import { RefObject } from 'react';
import { AppData } from '@/data/apps';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';

/**
 * Determines if the current device is iOS or macOS
 */
export const isIOSOrMacOS = (): boolean => {
  return /iPad|iPhone|iPod|Mac/.test(navigator.userAgent) && 
         (!/iPad|iPhone|iPod/.test(navigator.userAgent) || !(window as any).MSStream);
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

  // Try different image strategies based on retry count
  if (retryCount === 0) {
    // First retry: add a cache buster
    const timestamp = new Date().getTime();
    const newUrl = iconUrl.split('?')[0] + '?' + timestamp;
    onRetry(newUrl);
    if (imageRef.current) {
      imageRef.current.src = newUrl;
    }
  } 
  else if (retryCount === 1) {
    // Second retry: try Google Favicon API as a fallback
    const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    const newUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    onRetry(newUrl);
    if (imageRef.current) {
      imageRef.current.src = newUrl;
    }
  }
  else if (retryCount === 2 && isIOSOrMacOS()) {
    // Third retry specifically for iOS/macOS: try another favicon service
    const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    const newUrl = `https://api.faviconkit.com/${domain}/128`;
    onRetry(newUrl);
    if (imageRef.current) {
      imageRef.current.src = newUrl;
    }
  }
  else {
    // If all retries failed, show fallback
    onError();
  }
};

/**
 * Preload an image for iOS/macOS devices
 */
export const preloadImageForIOSMacOS = (
  url: string, 
  onSuccess: () => void, 
  onError: () => void
): void => {
  if (!isIOSOrMacOS()) return;
  
  const img = new Image();
  img.src = url;
  img.onload = onSuccess;
  img.onerror = onError;
};

/**
 * Check if an image is already loaded from cache
 */
export const checkImagePreloaded = (
  imageRef: RefObject<HTMLImageElement>,
  onLoaded: () => void
): void => {
  if (imageRef.current?.complete) {
    onLoaded();
  }
};
