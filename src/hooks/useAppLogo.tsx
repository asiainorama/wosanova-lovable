
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
  const maxRetries = 3; // Reduced retries to avoid too many attempts
  const imageRef = useRef<HTMLImageElement>(null);
  const [iconUrl, setIconUrl] = useState<string>(getCachedLogo(app));
  const [fetchedFromSupabase, setFetchedFromSupabase] = useState(false);
  
  // First check Supabase for icon, then fallback to cache
  useEffect(() => {
    let isMounted = true;
    
    const fetchIconFromSupabase = async () => {
      try {
        if (!isMounted) return;
        
        // Add a cache-busting timestamp parameter
        const timestamp = Date.now();
        
        // Check if we have this icon in the database
        const { data: iconData, error: iconError } = await supabase
          .from('app_icons')
          .select('icon_url, storage_path')
          .eq('app_id', app.id)
          .maybeSingle();

        if (!isMounted) return;

        if (iconData && iconData.icon_url) {
          // We found the icon in the database, use it with cache busting
          let url = iconData.icon_url;
          if (!url.includes('?')) {
            url = `${url}?t=${timestamp}`;
          }
          
          setIconUrl(url);
          setImageLoading(false);
          storeSuccessfulIcon(app, url, false);
          setFetchedFromSupabase(true);
          return;
        }

        // No icon in database yet, continue with the cached image
        setFetchedFromSupabase(false);
        
      } catch (err) {
        console.error('Error fetching app icon from Supabase:', err);
        // Continue with normal flow
        setFetchedFromSupabase(false);
      }
    };

    fetchIconFromSupabase();
    
    // Preload icons for iOS/macOS
    if (!fetchedFromSupabase) {
      preloadImageForIOSMacOS(
        iconUrl,
        () => {
          if (isMounted) {
            setImageLoading(false);
            storeSuccessfulIcon(app, iconUrl, imageError);
          }
        },
        () => {
          if (isMounted) {
            handleImageError();
          }
        }
      );
    }
    
    // Check if image is already loaded from cache
    if (imageRef.current && imageRef.current.complete) {
      setImageLoading(false);
      storeSuccessfulIcon(app, iconUrl, imageError);
    }
    
    return () => {
      isMounted = false;
    };
  }, [app.id]);

  // Function to handle image error
  const handleImageError = () => {
    console.log(`Error loading icon for ${app.name}, retry ${retryCount + 1} of ${maxRetries}`);
    
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
