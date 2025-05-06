
import { useEffect, useState, useCallback } from 'react';
import { useAppContext } from './AppContext';
import { aiApps, AppData, allApps } from '@/data/apps';
import { 
  entertainmentApps, 
  productivityApps, 
  socialMediaApps, 
  otherPopularApps, 
  investmentApps 
} from '@/data/additionalApps';
import { additionalApps } from '@/data/moreApps';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const AppContextUpdater = () => {
  const { setAllApps, favorites } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Update app list in context
  const updateAppsList = useCallback((apps: AppData[]) => {
    setAllApps(apps);
    console.log(`Updated app list with ${apps.length} apps`);
  }, [setAllApps]);
  
  // Function to store app icon in Supabase
  const storeIconInSupabase = async (app: AppData, iconUrl: string) => {
    try {
      // Skip for placeholder images or already processed icons
      if (iconUrl.includes('placeholder') || iconUrl.includes('app-logos')) {
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

      // Download the image
      const response = await fetch(iconUrl);
      if (!response.ok) {
        return false;
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
        return false;
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
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error storing icon in Supabase:', error);
      return false;
    }
  };

  // Prefetch and store app icons
  const prefetchAndStoreIcons = async (apps: AppData[]) => {
    console.log(`Pre-fetching and storing ${apps.length} app icons`);
    let successCount = 0;
    
    // Process in small batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < apps.length; i += batchSize) {
      const batch = apps.slice(i, i + batchSize);
      await Promise.all(batch.map(async (app) => {
        if (app.icon && !app.icon.includes('placeholder')) {
          const success = await storeIconInSupabase(app, app.icon);
          if (success) successCount++;
        }
      }));
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Successfully stored ${successCount} icons in Supabase`);
    return successCount;
  };
  
  useEffect(() => {
    console.log('AppContextUpdater initialized');
    
    // Check if this is a first load or a refresh
    let loadIndicator = sessionStorage.getItem('app_load_indicator');
    if (!loadIndicator) {
      sessionStorage.setItem('app_load_indicator', 'loaded');
    } else {
      setIsFirstLoad(false);
    }
    
    // Listen for theme changes to refresh icons
    const handleThemeChange = () => {
      console.log('Theme changed, refreshing app icons');
      document.querySelectorAll('img.app-icon').forEach((img: any) => {
        // Force image reload on theme change by appending timestamp
        if (img.src && !img.src.includes('data:image')) {
          const timestamp = new Date().getTime();
          img.src = img.src.split('?')[0] + '?' + timestamp;
        }
      });
    };

    document.addEventListener('themechange', handleThemeChange);
    
    // Combine all app data - use the exported allApps instead of recreating it
    console.log(`Setting initial ${allApps.length} apps`);
    updateAppsList(allApps);
    
    // Preload icons for favorite apps first as they're most important
    const priorityApps = favorites.length > 0 
      ? [...favorites]
      : allApps.slice(0, 10); // If no favorites, preload first 10 apps
    
    // Start prefetching icons in background
    setTimeout(() => {
      prefetchAppLogos(priorityApps).then(() => {
        // After prioritizing favorites, process the rest and store in Supabase
        const remainingApps = allApps.filter(app => 
          !priorityApps.some(priorityApp => priorityApp.id === app.id)
        );
        
        // Process remaining apps in chunks
        const processRemainingInChunks = async () => {
          const chunkSize = 30;
          for (let i = 0; i < remainingApps.length; i += chunkSize) {
            const chunk = remainingApps.slice(i, i + chunkSize);
            await prefetchAppLogos(chunk);
            
            // Update UI with processed apps
            updateAppsList([...allApps]);
            
            // Small delay between chunks
            if (i + chunkSize < remainingApps.length) {
              await new Promise(r => setTimeout(r, 200));
            }
          }
          
          setLoading(false);
          
          // Only show toast on first load, not on background refreshes
          if (isFirstLoad) {
            toast.success('Aplicación cargada correctamente', {
              className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
            });
            
            // In background, start storing icons in Supabase
            prefetchAndStoreIcons(allApps);
          }
        };
        
        processRemainingInChunks();
      });
    }, 1000);
    
    // Cleanup function
    return () => {
      document.removeEventListener('themechange', handleThemeChange);
      console.log('AppContextUpdater cleanup');
    };
  }, [setAllApps, updateAppsList, favorites, isFirstLoad]);

  return null;
};

export default AppContextUpdater;
