
import { useEffect, useState } from 'react';
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
import { fixAppIcons } from '@/utils/iconUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export const AppContextUpdater = () => {
  const { setAllApps } = useAppContext();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Listen for theme changes to potentially refresh icons
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
    
    // Immediately set some apps with placeholder icons for faster initial render
    const combinedApps = [
      ...aiApps,
      ...additionalApps,
      ...entertainmentApps,
      ...productivityApps,
      ...socialMediaApps,
      ...otherPopularApps,
      ...investmentApps
    ];
    
    // First add apps with basic placeholder icons for immediate display
    setAllApps(combinedApps);
    
    // Then process icons in the background
    const processIconsAsync = async () => {
      try {
        // Process in smaller batches to avoid overwhelming the browser
        const batchSize = 20;
        let processedApps: AppData[] = [];
        
        // Process apps in batches for better user experience
        for (let i = 0; i < combinedApps.length; i += batchSize) {
          const batch = combinedApps.slice(i, i + batchSize);
          const processedBatch = await fixAppIcons(batch);
          processedApps = [...processedApps, ...processedBatch];
          
          // Update the context with what we have so far
          setAllApps([...processedApps, ...combinedApps.slice(i + batchSize)]);
        }
        
        // Final update with all processed apps
        setAllApps(processedApps);
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
    };
  }, [setAllApps]);

  return null;
};

export default AppContextUpdater;
