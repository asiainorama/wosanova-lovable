
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

  // Debounced function to update apps in context
  const updateAppsList = useCallback((apps: AppData[]) => {
    setAllApps(apps);
    console.log(`Updated app list with ${apps.length} apps`);
  }, [setAllApps]);
  
  useEffect(() => {
    console.log('AppContextUpdater initialized');
    
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
    
    // Preload icons for favorite apps first as they're most important
    const priorityApps = favorites.length > 0 
      ? [...favorites]
      : combinedApps.slice(0, 10); // If no favorites, preload first 10 apps
      
    // Preload common app icons
    preloadCommonAppIcons(priorityApps);
    
    // Then process all icons in the background with improved batching
    const processIconsAsync = async () => {
      try {
        // Process in smaller batches to avoid overwhelming the browser
        const batchSize = 12; // Adjusted batch size for better performance
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
            
            // Small delay between batches to not block UI thread
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (batchError) {
            console.error(`Error processing batch ${i}-${i+batchSize}:`, batchError);
            
            // Still update with unprocessed batch to avoid stopping the entire process
            processedApps = [...processedApps, ...batch];
            failed += batch.length;
          }
        }
        
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
        
        // Log detailed statistics
        console.log(`App icons processing complete. Total: ${combinedApps.length}, Success: ${successful}, Failed: ${failed}`);
        
        // Final update with all processed apps - filter out duplicates
        const finalApps = Array.from(
          new Map(processedApps.map(app => [app.id, app])).values()
        );
        updateAppsList(finalApps);
        setLoading(false);
      } catch (error) {
        console.error('Error processing app icons:', error);
        toast.error('Error al cargar algunos íconos de aplicaciones', {
          className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
        });
      }
    };

    processIconsAsync();
    
    // Cleanup function
    return () => {
      document.removeEventListener('themechange', handleThemeChange);
      console.log('AppContextUpdater cleanup');
    };
  }, [setAllApps, updateAppsList, favorites]);

  return null;
};

export default AppContextUpdater;
