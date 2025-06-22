
import { useEffect, useState, useCallback } from 'react';
import { useAppContext } from './AppContext';
import { AppData } from '@/data/types';
import { fastImagePreloader } from '@/services/FastImagePreloader';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchAppsFromSupabase } from '@/services/AppsService';

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
    console.log('AppContextUpdater initialized - Fast mode');
    
    // Check if this is a first load or a refresh
    let loadIndicator = sessionStorage.getItem('app_load_indicator');
    if (!loadIndicator) {
      sessionStorage.setItem('app_load_indicator', 'loaded');
    } else {
      setIsFirstLoad(false);
    }
    
    // Fetch apps from Supabase with optimized loading
    const loadAppsFromSupabase = async () => {
      try {
        const appsData = await fetchAppsFromSupabase();
        console.log(`Setting initial ${appsData.length} apps from Supabase`);
        updateAppsList(appsData);
        
        // Precarga inmediata de imágenes críticas
        const priorityApps = favorites.length > 0 
          ? [...favorites]
          : appsData.slice(0, 15); // Precargar las primeras 15 apps
        
        // Iniciar precarga inmediata
        fastImagePreloader.preloadCriticalImages(priorityApps).then(() => {
          console.log('Critical images preloaded');
          
          // Continuar con el resto en segundo plano
          const remainingApps = appsData.filter(app => 
            !priorityApps.some(priorityApp => priorityApp.id === app.id)
          );
          
          if (remainingApps.length > 0) {
            fastImagePreloader.preloadCriticalImages(remainingApps.slice(0, 30));
          }
        });
      
        setLoading(false);
        
        // Show success toast only on first load
        if (isFirstLoad) {
          toast.success('Aplicación cargada correctamente', {
            className: document.documentElement.classList.contains('dark') ? 'dark-toast' : '',
          });
        }
        
      } catch (error) {
        console.error('Error loading apps from Supabase:', error);
        setLoading(false);
      }
    };
    
    loadAppsFromSupabase();
    
    // Cleanup function
    return () => {
      console.log('AppContextUpdater cleanup');
    };
  }, [updateAppsList, favorites, isFirstLoad]);

  return null;
};

export default AppContextUpdater;
