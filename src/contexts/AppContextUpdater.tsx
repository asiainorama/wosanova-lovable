
import { useEffect, useState, useCallback } from 'react';
import { useAppContext } from './AppContext';
import { AppData } from '@/data/types';
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
import { fetchAppsFromSupabase } from '@/services/AppsService';

export const AppContextUpdater = () => {
  const { setAllApps, favorites } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [iconStorageQueue, setIconStorageQueue] = useState<AppData[]>([]);
  const [allApps, setLocalApps] = useState<AppData[]>([]);

  // Update app list in context
  const updateAppsList = useCallback((apps: AppData[]) => {
    setAllApps(apps);
    setLocalApps(apps);
    console.log(`Updated app list with ${apps.length} apps`);
  }, [setAllApps]);
  
  // Function to store app icon in Supabase with retry logic
  const storeIconInSupabase = async (app: AppData, iconUrl: string, retryCount = 0): Promise<boolean> => {
    try {
      // Skip for placeholder images or already processed icons
      if (iconUrl.includes('placeholder') || iconUrl.includes('app-logos')) {
        return false;
      }

      if (retryCount > 3) {
        console.warn(`Failed to store icon for ${app.name} after multiple retries`);
        return false;
      }

      // Check if we already have this icon stored
      const { data: existingIcon, error: checkError } = await supabase
        .from('app_icons')
        .select('id')
        .eq('app_id', app.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing icon:', checkError);
        return false;
      }
      
      if (existingIcon) {
        return true; // Icon already stored
      }

      // Try different fallback URLs if initial URL fails
      const urlsToTry = [
        iconUrl,
        // Google Favicon API as fallback
        `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}&sz=128`,
        // Additional fallback for favicon
        `https://api.faviconkit.com/${new URL(app.url).hostname}/144`
      ];
      
      let blob: Blob | null = null;
      let contentType = '';
      
      // Try each URL until one works
      for (const url of urlsToTry) {
        try {
          const response = await fetch(url, { 
            mode: 'cors', 
            cache: 'no-cache',
            headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
          });
          
          if (response.ok) {
            blob = await response.blob();
            contentType = response.headers.get('content-type') || 'image/png';
            break;
          }
        } catch (err) {
          console.warn(`Error fetching from ${url}:`, err);
          continue;
        }
      }
      
      if (!blob) {
        // If still no success, retry with different strategy later
        if (retryCount < 3) {
          setTimeout(() => {
            storeIconInSupabase(app, iconUrl, retryCount + 1);
          }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
        }
        return false;
      }
      
      // File extension based on content type
      const extension = contentType.split('/')[1] || 'png';
      
      // Generate a unique filename
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
        console.error('Error uploading icon to storage:', uploadError);
        return false;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('app-logos')
        .getPublicUrl(filePath);
      
      if (publicUrlData) {
        const publicUrl = publicUrlData.publicUrl;
        
        // Add cache-busting parameter
        const cacheBustedUrl = `${publicUrl}?t=${timestamp}`;
        
        // Store the reference in our app_icons table
        const { error: insertError } = await supabase
          .from('app_icons')
          .insert({
            app_id: app.id,
            icon_url: cacheBustedUrl,
            storage_path: filePath,
          });
        
        if (insertError) {
          console.error('Error inserting icon record:', insertError);
          return false;
        }
        
        console.log(`Successfully stored icon for ${app.name} in Supabase`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error storing icon in Supabase:', error);
      
      // Retry with exponential backoff
      if (retryCount < 3) {
        setTimeout(() => {
          storeIconInSupabase(app, iconUrl, retryCount + 1);
        }, 1000 * Math.pow(2, retryCount));
      }
      
      return false;
    }
  };

  // Prefetch and store app icons with improved batching
  const prefetchAndStoreIcons = async (apps: AppData[], priority = false) => {
    if (priority) {
      console.log(`Pre-fetching and storing ${apps.length} priority app icons`);
    } else {
      console.log(`Processing ${apps.length} app icons in background`);
    }
    
    let successCount = 0;
    
    // Process in small batches to avoid rate limits
    const batchSize = priority ? 10 : 5;
    const delayBetweenBatches = priority ? 300 : 500;
    
    for (let i = 0; i < apps.length; i += batchSize) {
      const batch = apps.slice(i, i + batchSize);
      await Promise.all(batch.map(async (app) => {
        if (app.icon && !app.icon.includes('placeholder')) {
          const success = await storeIconInSupabase(app, app.icon);
          if (success) successCount++;
        }
      }));
      
      // Small delay between batches
      if (i + batchSize < apps.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    console.log(`Successfully stored ${successCount} icons in Supabase`);
    return successCount;
  };
  
  // Check if all app icons are stored in database
  const checkAllAppIcons = useCallback(async () => {
    try {
      // Fetch apps from Supabase first to get the current list
      const appsFromSupabase = await fetchAppsFromSupabase();
      
      // Count how many apps we have
      const totalApps = appsFromSupabase.length;
      
      // Count how many icons are stored in the database
      const { count, error } = await supabase
        .from('app_icons')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error checking stored icons:', error);
        return false;
      }
      
      console.log(`Found ${count} icons stored in database out of ${totalApps} apps`);
      
      // If we're missing icons, queue them for storage
      if (count !== null && count < totalApps) {
        // Find the apps without icons
        const { data: storedIcons } = await supabase
          .from('app_icons')
          .select('app_id');
        
        if (!storedIcons) return false;
        
        const storedAppIds = new Set(storedIcons.map(icon => icon.app_id));
        const appsWithoutIcons = appsFromSupabase.filter(app => !storedAppIds.has(app.id));
        
        console.log(`Found ${appsWithoutIcons.length} apps without stored icons, queuing for storage`);
        setIconStorageQueue(appsWithoutIcons);
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking app icons:', error);
      return false;
    }
  }, []);
  
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
    
    // Fetch apps from Supabase
    const loadAppsFromSupabase = async () => {
      try {
        const appsData = await fetchAppsFromSupabase();
        console.log(`Setting initial ${appsData.length} apps from Supabase`);
        updateAppsList(appsData);
        
        // Check if we need to store more app icons
        checkAllAppIcons();
        
        // Preload icons for favorite apps first as they're most important
        const priorityApps = favorites.length > 0 
          ? [...favorites]
          : appsData.slice(0, 10); // If no favorites, preload first 10 apps
        
        // Start prefetching icons in background
        setTimeout(() => {
          prefetchAppLogos(priorityApps).then(() => {
            // After prioritizing favorites, process the rest
            const remainingApps = appsData.filter(app => 
              !priorityApps.some(priorityApp => priorityApp.id === app.id)
            );
            
            // Process remaining apps in chunks
            const processRemainingInChunks = async () => {
              const chunkSize = 30;
              for (let i = 0; i < remainingApps.length; i += chunkSize) {
                const chunk = remainingApps.slice(i, i + chunkSize);
                await prefetchAppLogos(chunk);
                
                // Update UI with processed apps
                updateAppsList([...appsData]);
                
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
              }
              
              // Start storing icons in Supabase in the background
              prefetchAndStoreIcons(appsData.slice(0, 50), true);
            };
            
            processRemainingInChunks();
          });
        }, 1000);
      } catch (error) {
        console.error('Error loading apps from Supabase:', error);
        setLoading(false);
      }
    };
    
    loadAppsFromSupabase();
    
    // Cleanup function
    return () => {
      document.removeEventListener('themechange', handleThemeChange);
      console.log('AppContextUpdater cleanup');
    };
  }, [updateAppsList, favorites, isFirstLoad, checkAllAppIcons]);

  // Process queued icons storage in batches
  useEffect(() => {
    if (iconStorageQueue.length > 0) {
      const processQueue = async () => {
        // Process in small batches
        const batchSize = 5;
        const currentBatch = iconStorageQueue.slice(0, batchSize);
        
        console.log(`Processing icon storage queue: ${currentBatch.length} of ${iconStorageQueue.length} remaining`);
        
        await prefetchAndStoreIcons(currentBatch);
        
        // Update the queue
        setIconStorageQueue(prev => prev.slice(batchSize));
      };
      
      // Start processing after a short delay
      const timerId = setTimeout(processQueue, 2000);
      return () => clearTimeout(timerId);
    }
  }, [iconStorageQueue]);

  return null;
};

export default AppContextUpdater;
