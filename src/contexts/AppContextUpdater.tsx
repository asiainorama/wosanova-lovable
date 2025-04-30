
import { useEffect, useState, useCallback } from 'react';
import { useAppContext } from './AppContext';
import { aiApps, AppData } from '@/data/apps';
import { 
  entertainmentApps, 
  productivityApps, 
  socialMediaApps, 
  otherPopularApps, 
  investmentApps 
} from '@/data/additionalApps';
import { additionalApps } from '@/data/moreApps';
import { fixAppIcons, preloadCommonAppIcons } from '@/utils/iconUtils';
import { toast } from 'sonner';

export const AppContextUpdater = () => {
  const { setAllApps, favorites } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0
  });

  // Track whether this is the first load or a refresh
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Debounced function to update apps in context
  const updateAppsList = useCallback((apps: AppData[]) => {
    setAllApps(apps);
    console.log(`Updated app list with ${apps.length} apps`);
  }, [setAllApps]);
  
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
    
    // Combine all app data
    const combinedApps = [
      ...aiApps,
      ...additionalApps,
      ...entertainmentApps,
      ...productivityApps,
      ...socialMediaApps,
      ...otherPopularApps,
      ...investmentApps
    ];
    
    setProcessingStats({
      total: combinedApps.length,
      processed: 0,
      successful: 0,
      failed: 0
    });
    
    // First add apps with basic placeholder icons for immediate display
    console.log(`Setting initial ${combinedApps.length} apps with placeholder icons`);
    setAllApps(combinedApps);
    
    // Try to restore cached icons from previous sessions
    const restoreCachedIcons = async () => {
      try {
        // Check if we have a recently cached complete app list
        const cachedAppList = localStorage.getItem('complete_app_list');
        const cachedTimestamp = localStorage.getItem('complete_app_list_timestamp');
        
        // If we have a recent cache (less than 1 day old), use it
        if (cachedAppList && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          const maxAge = 24 * 60 * 60 * 1000; // 1 day
          
          if (now - timestamp < maxAge) {
            try {
              const parsedApps = JSON.parse(cachedAppList);
              console.log(`Restored ${parsedApps.length} apps with icons from cache`);
              updateAppsList(parsedApps);
              
              // Still process icons in the background, but with lower priority
              setTimeout(() => {
                processIconsAsync(true);
              }, 5000);
              
              return;
            } catch (e) {
              console.error('Error parsing cached app list:', e);
              // Continue with normal flow if parsing fails
            }
          }
        }
        
        // No cache or expired cache, proceed with normal icon processing
        processIconsAsync(false);
      } catch (e) {
        console.error('Error restoring cached icons:', e);
        processIconsAsync(false);
      }
    };
    
    // Preload icons for favorite apps first as they're most important
    const priorityApps = favorites.length > 0 
      ? [...favorites]
      : combinedApps.slice(0, 10); // If no favorites, preload first 10 apps
      
    // Preload common app icons
    preloadCommonAppIcons(priorityApps);
    
    // Then start icon processing
    restoreCachedIcons();
    
    // Main icon processing function
    const processIconsAsync = async (isBackgroundRefresh = false) => {
      try {
        // Process in smaller batches to avoid overwhelming the browser
        const batchSize = isBackgroundRefresh ? 20 : 12; // Larger batches for background refresh
        let processedApps: AppData[] = [];
        let successful = 0;
        let failed = 0;
        
        // Process apps in batches for better user experience
        // First process AI apps and favorites (most important)
        const importantApps = [...aiApps, ...favorites];
        const remainingApps = combinedApps.filter(app => 
          !importantApps.some(impApp => impApp.id === app.id)
        );
        
        // Process important apps first
        const processedImportantApps = await fixAppIcons(importantApps);
        processedApps = [...processedImportantApps];
        
        // Update immediately with important apps
        const initialUpdate = [
          ...processedImportantApps,
          ...remainingApps
        ];
        updateAppsList(initialUpdate);
        
        // Process the rest in batches
        for (let i = 0; i < remainingApps.length; i += batchSize) {
          const batch = remainingApps.slice(i, i + batchSize);
          
          try {
            console.log(`Processing batch ${i}-${i+batchSize} of ${remainingApps.length} remaining apps`);
            const processedBatch = await fixAppIcons(batch);
            
            // Count successful and failed icons
            processedBatch.forEach(app => {
              if (app.icon && !app.icon.includes('placeholder')) {
                successful++;
              } else {
                failed++;
              }
            });
            
            // Replace the corresponding apps in our processed list
            const updatedApps = [
              ...processedApps,
              ...processedBatch,
              ...remainingApps.slice(i + batchSize)
            ];
            
            // Filter out duplicates (when an app appears in multiple categories)
            const uniqueApps = Array.from(
              new Map(updatedApps.map(app => [app.id, app])).values()
            );
            
            // Update the context with what we have so far
            updateAppsList(uniqueApps);
            processedApps = [
              ...processedApps,
              ...processedBatch
            ];
            
            // Update processing stats
            setProcessingStats(prev => ({
              ...prev,
              processed: importantApps.length + Math.min(i + batchSize, remainingApps.length),
              successful: importantApps.length + successful,
              failed
            }));
            
            // Save the complete app list to localStorage periodically (every 3 batches)
            if ((i / batchSize) % 3 === 0 || i + batchSize >= remainingApps.length) {
              try {
                const currentApps = Array.from(
                  new Map(processedApps.map(app => [app.id, app])).values()
                );
                localStorage.setItem('complete_app_list', JSON.stringify(currentApps));
                localStorage.setItem('complete_app_list_timestamp', Date.now().toString());
              } catch (e) {
                console.warn('Failed to save complete app list to cache:', e);
              }
            }
            
            // Small delay between batches to not block UI thread
            await new Promise(resolve => setTimeout(resolve, isBackgroundRefresh ? 300 : 100));
          } catch (batchError) {
            console.error(`Error processing batch ${i}-${i+batchSize}:`, batchError);
            
            // Still update with unprocessed batch to avoid stopping the entire process
            processedApps = [...processedApps, ...batch];
            failed += batch.length;
          }
        }
        
        // Only show toast on first load, not on background refreshes
        if (!isBackgroundRefresh) {
          // Show success message if most icons were loaded successfully
          const successRate = (successful / combinedApps.length) * 100;
          if (successRate > 80) {
            toast.success(`Íconos cargados: ${Math.round(successRate)}%`, {
              className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
            });
          } else if (successRate > 50) {
            toast.info(`Íconos cargados: ${Math.round(successRate)}%`, {
              className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
            });
          } else {
            toast.warning(`Algunos íconos no se pudieron cargar`, {
              className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
            });
          }
        }
        
        // Log detailed statistics
        console.log(`App icons processing complete. Total: ${combinedApps.length}, Success: ${successful}, Failed: ${failed}`);
        
        // Final update with all processed apps - filter out duplicates
        const finalApps = Array.from(
          new Map(processedApps.map(app => [app.id, app])).values()
        );
        updateAppsList(finalApps);
        
        // Save the final complete list to localStorage
        try {
          localStorage.setItem('complete_app_list', JSON.stringify(finalApps));
          localStorage.setItem('complete_app_list_timestamp', Date.now().toString());
        } catch (e) {
          console.warn('Failed to save final app list to cache:', e);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error processing app icons:', error);
        if (!isBackgroundRefresh) {
          toast.error('Error al cargar algunos íconos de aplicaciones', {
            className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
          });
        }
      }
    };
    
    // Cleanup function
    return () => {
      document.removeEventListener('themechange', handleThemeChange);
      console.log('AppContextUpdater cleanup');
    };
  }, [setAllApps, updateAppsList, favorites]);

  return null;
};

export default AppContextUpdater;
