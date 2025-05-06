
import { useState, useEffect, useRef } from 'react';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';
import { supabase } from '@/integrations/supabase/client';
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
 * Hook to handle app logo loading, caching, and fallbacks with Supabase storage
 */
export const useAppLogo = (app: AppData): UseAppLogoResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3; // Increased retries for iOS/macOS
  const imageRef = useRef<HTMLImageElement>(null);
  const [iconUrl, setIconUrl] = useState<string>(getCachedLogo(app));
  
  // Check for logo in Supabase database first, then fallback to local cache
  useEffect(() => {
    const fetchIconFromSupabase = async () => {
      try {
        // Check if we have this icon in the database
        const { data: iconData, error: iconError } = await supabase
          .from('app_icons')
          .select('icon_url, storage_path')
          .eq('app_id', app.id)
          .single();

        if (iconData && iconData.icon_url) {
          // We found the icon in the database, use it
          setIconUrl(iconData.icon_url);
          setImageLoading(false);
          storeSuccessfulIcon(app, iconData.icon_url, false);
          return;
        }

        // No icon in database yet, try to fetch and store it
        if (!iconError || iconError.code === 'PGRST116') {
          // If not found or other error, use the cached image first
          const cachedLogo = getCachedLogo(app);
          setIconUrl(cachedLogo);
          
          // Then try to fetch and store the remote icon
          if (app.icon && !app.icon.includes('placeholder')) {
            // Try to download and store this icon for future use
            storeIconInSupabase(app, app.icon);
          }
        }
      } catch (err) {
        console.error('Error fetching app icon from Supabase:', err);
        // Fallback to cache
        const cachedLogo = getCachedLogo(app);
        setIconUrl(cachedLogo);
      }
    };

    fetchIconFromSupabase();
    
    // Preload icons for iOS/macOS
    preloadImageForIOSMacOS(
      iconUrl,
      () => {
        setImageLoading(false);
        storeSuccessfulIcon(app, iconUrl, imageError);
      },
      handleImageError
    );
    
    // Check if image is already loaded from cache
    checkImagePreloaded(imageRef, () => {
      setImageLoading(false);
      storeSuccessfulIcon(app, iconUrl, imageError);
    });
  }, [app.id]);

  // Function to store icon in Supabase
  const storeIconInSupabase = async (app: AppData, iconUrl: string) => {
    try {
      // Skip for placeholder images or already processed icons
      if (iconUrl.includes('placeholder') || iconUrl.includes('app-logos')) {
        return;
      }

      // Check if we already have this icon stored
      const { data: existingIcon } = await supabase
        .from('app_icons')
        .select('id')
        .eq('app_id', app.id)
        .single();
      
      if (existingIcon) {
        return; // Icon already stored
      }

      // Download the image
      const response = await fetch(iconUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // File extension based on content type
      const contentType = response.headers.get('content-type') || 'image/png';
      const extension = contentType.split('/')[1] || 'png';
      
      // Generate a unique filename
      const filename = `${app.id}-${Date.now()}.${extension}`;
      const filePath = `${app.id}/${filename}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('app-logos')
        .upload(filePath, blob, {
          contentType,
          cacheControl: '3600',
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('app-logos')
        .getPublicUrl(filePath);
      
      if (publicUrlData) {
        const publicUrl = publicUrlData.publicUrl;
        
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
          // Update our view with the new URL
          setIconUrl(publicUrl);
        }
      }
    } catch (error) {
      console.error('Error storing icon in Supabase:', error);
      // Silently fail - we'll use the cached icon
    }
  };
  
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

    // If this is not a Supabase URL, store it
    if (iconUrl && !iconUrl.includes('app-logos') && !iconUrl.includes('placeholder')) {
      storeIconInSupabase(app, iconUrl);
    }
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
