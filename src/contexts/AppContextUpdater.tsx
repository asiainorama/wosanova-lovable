
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
import { toast } from 'sonner';

export const AppContextUpdater = () => {
  const { setAllApps } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0
  });
  
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
    
    setProcessingStats({
      total: combinedApps.length,
      processed: 0,
      successful: 0,
      failed: 0
    });
    
    // First add apps with basic placeholder icons for immediate display
    console.log(`Setting initial ${combinedApps.length} apps with placeholder icons`);
    setAllApps(combinedApps);
    
    // Then process icons in the background
    const processIconsAsync = async () => {
      try {
        // Process in smaller batches to avoid overwhelming the browser
        const batchSize = 10; // Reduced batch size for better responsiveness
        let processedApps: AppData[] = [];
        let successful = 0;
        let failed = 0;
        
        // Process apps in batches for better user experience
        for (let i = 0; i < combinedApps.length; i += batchSize) {
          const batch = combinedApps.slice(i, i + batchSize);
          
          try {
            console.log(`Processing batch ${i}-${i+batchSize} of ${combinedApps.length} apps`);
            const processedBatch = await fixAppIcons(batch);
            
            // Count successful and failed icons
            processedBatch.forEach(app => {
              if (app.icon && !app.icon.includes('placeholder')) {
                successful++;
              } else {
                failed++;
              }
            });
            
            processedApps = [...processedApps, ...processedBatch];
            
            // Update the context with what we have so far
            const updatedApps = [
              ...processedApps,
              ...combinedApps.slice(i + batchSize)
            ];
            
            console.log(`Updating with ${processedApps.length} processed apps, ${successful} successful, ${failed} failed`);
            setAllApps(updatedApps);
            
            // Update processing stats
            setProcessingStats(prev => ({
              ...prev,
              processed: i + batchSize > combinedApps.length ? combinedApps.length : i + batchSize,
              successful,
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
      console.log('AppContextUpdater cleanup');
    };
  }, [setAllApps]);

  return null;
};

export default AppContextUpdater;
