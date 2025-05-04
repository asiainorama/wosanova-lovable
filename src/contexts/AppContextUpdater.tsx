
import { useEffect, useState, useCallback } from 'react';
import { useAppContext } from './AppContext';
import { allApps as apps, AppData } from '@/data/apps';
import { prefetchAppLogos } from '@/services/LogoCacheService';
import { toast } from 'sonner';

export const AppContextUpdater = () => {
  const { setAllApps, favorites } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Update app list in context
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
    
    // Use the consolidated apps list from apps.ts
    console.log(`Setting initial ${apps.length} apps`);
    updateAppsList(apps);
    
    // Preload icons for favorite apps first as they're most important
    const priorityApps = favorites.length > 0 
      ? [...favorites]
      : apps.slice(0, 10); // If no favorites, preload first 10 apps
    
    // Start prefetching icons in background
    setTimeout(() => {
      prefetchAppLogos(priorityApps).then(() => {
        // After prioritizing favorites, slowly process the rest
        const remainingApps = apps.filter(app => 
          !priorityApps.some(priorityApp => priorityApp.id === app.id)
        );
        
        // Process remaining apps in chunks
        const processRemainingInChunks = async () => {
          const chunkSize = 30;
          for (let i = 0; i < remainingApps.length; i += chunkSize) {
            const chunk = remainingApps.slice(i, i + chunkSize);
            await prefetchAppLogos(chunk);
            
            // Update UI with processed apps
            updateAppsList([...apps]);
            
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
