
import { useEffect } from 'react';
import { useAppContext } from './AppContext';
import { aiApps } from '@/data/apps';
import { 
  entertainmentApps, 
  productivityApps, 
  socialMediaApps, 
  otherPopularApps, 
  investmentApps 
} from '@/data/additionalApps';
import { additionalApps } from '@/data/moreApps';
import { fixAppIcons } from '@/utils/iconUtils';

export const AppContextUpdater = () => {
  const { setAllApps } = useAppContext();
  
  useEffect(() => {
    const updateApps = async () => {
      // Combine all app sources
      const combinedApps = [
        ...aiApps,
        ...additionalApps,
        ...entertainmentApps,
        ...productivityApps,
        ...socialMediaApps,
        ...otherPopularApps,
        ...investmentApps
      ];
      
      // Fix icons using Brandfetch API and fallbacks
      const appsWithIcons = await fixAppIcons(combinedApps);
      
      // Update the context with all apps
      setAllApps(appsWithIcons);
    };

    updateApps();
  }, [setAllApps]);

  return null;
};

export default AppContextUpdater;
