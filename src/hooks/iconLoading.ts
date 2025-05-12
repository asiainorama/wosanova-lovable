
import { RefObject } from 'react';
import { AppData } from '@/data/apps';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Determines if the current device is iOS or macOS
 */
export const isIOSOrMacOS = (): boolean => {
  return /iPad|iPhone|iPod|Mac/.test(navigator.userAgent) && 
         (!/iPad|iPhone|iPod/.test(navigator.userAgent) || !(window as any).MSStream);
};

/**
 * Store app logo in Supabase when successfully loaded
 */
export const storeLogoInSupabase = async (app: AppData, iconUrl: string): Promise<boolean> => {
  try {
    // Skip for placeholder images or already processed icons
    if (!app.url || iconUrl.includes('placeholder')) {
      return false;
    }

    // Check if we already have this icon stored
    const { data: existingIcon } = await supabase
      .from('app_icons')
      .select('id')
      .eq('app_id', app.id)
      .maybeSingle();
    
    if (existingIcon) {
      return true; // Icon already stored
    }
    
    // Don't try to download supabase storage URLs again
    if (iconUrl.includes('app-logos')) {
      return false;
    }

    // Check if the icon URL is in session storage
    const cachedIconKey = `icon_${app.id}`;
    const cachedIconUrl = sessionStorage.getItem(cachedIconKey);
    
    if (cachedIconUrl === iconUrl) {
      console.log(`Using cached icon URL for ${app.name}`);
      return true;
    }

    // Try to download the image with cache control
    const response = await fetch(iconUrl, { 
      mode: 'cors',
      cache: 'no-cache',
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // File extension based on content type
    const contentType = response.headers.get('content-type') || 'image/png';
    const extension = contentType.split('/')[1] || 'png';
    
    // Generate a unique filename with timestamp for cache busting
    const timestamp = Date.now();
    const filename = `${app.id}-${timestamp}.${extension}`;
    const filePath = `${app.id}/${filename}`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('app-logos')
      .upload(filePath, blob, {
        contentType,
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('app-logos')
      .getPublicUrl(filePath);
    
    if (publicUrlData) {
      const publicUrl = `${publicUrlData.publicUrl}?t=${timestamp}`;
      
      // Store the reference in our app_icons table
      const { error: insertError } = await supabase
        .from('app_icons')
        .insert({
          app_id: app.id,
          icon_url: publicUrl,
          storage_path: filePath,
        });
      
      if (!insertError) {
        console.log(`Stored icon for ${app.name} in Supabase`);
        
        // Save to session storage
        sessionStorage.setItem(cachedIconKey, publicUrl);
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error storing icon in Supabase:', error);
    return false;
  }
};

/**
 * Store icon URL when successfully loaded
 */
export const storeSuccessfulIcon = (app: AppData, iconUrl: string, hasError: boolean): void => {
  if (app.url && !hasError && iconUrl && !iconUrl.includes('placeholder')) {
    try {
      // Extract domain from the app URL
      const domain = new URL(app.url).hostname.replace('www.', '');
      registerSuccessfulLogo(app.id, iconUrl, domain);
      
      // Cache in session storage
      const cachedIconKey = `icon_${app.id}`;
      sessionStorage.setItem(cachedIconKey, iconUrl);
      
      // Try to store in Supabase asynchronously
      if (!iconUrl.includes('app-logos')) {
        storeLogoInSupabase(app, iconUrl).catch(err => {
          // Silent catch for background processing
          console.warn('Background icon storage failed:', err);
        });
      }
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
  try {
    if (retryCount === 0) {
      // First retry: add a cache buster
      const timestamp = new Date().getTime();
      let newUrl = iconUrl;
      
      // Add cache busting parameter
      if (newUrl.includes('?')) {
        newUrl = newUrl.split('?')[0] + '?' + timestamp;
      } else {
        newUrl = newUrl + '?' + timestamp;
      }
      
      onRetry(newUrl);
      if (imageRef.current) {
        imageRef.current.src = newUrl;
      }
    } 
    else if (retryCount === 1) {
      // Check if we have a cached version in sessionStorage
      const cachedIconKey = `icon_${app.id}`;
      const cachedIconUrl = sessionStorage.getItem(cachedIconKey);
      
      if (cachedIconUrl && cachedIconUrl !== iconUrl) {
        onRetry(cachedIconUrl);
        if (imageRef.current) {
          imageRef.current.src = cachedIconUrl;
        }
        return;
      }
      
      // Second retry: try Google Favicon API as a fallback
      let domain;
      try {
        domain = new URL(app.url).hostname;
      } catch {
        domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      }
      const newUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      onRetry(newUrl);
      if (imageRef.current) {
        imageRef.current.src = newUrl;
      }
    }
    else {
      // If all retries failed, show fallback
      onError();
    }
  } catch (error) {
    console.error('Error in image loading fallback:', error);
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
  
  // Check sessionStorage first
  const cachedImageKey = `preloaded_${url}`;
  if (sessionStorage.getItem(cachedImageKey) === 'loaded') {
    onSuccess();
    return;
  }
  
  const img = new Image();
  img.src = url;
  img.onload = () => {
    sessionStorage.setItem(cachedImageKey, 'loaded');
    onSuccess();
  };
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
