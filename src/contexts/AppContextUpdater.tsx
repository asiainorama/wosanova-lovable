
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

export const AppContextUpdater = () => {
  const { setAllApps } = useAppContext();
  
  useEffect(() => {
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
    
    // Update the context with all apps
    setAllApps(combinedApps);
  }, [setAllApps]);

  return null;
};

export default AppContextUpdater;
