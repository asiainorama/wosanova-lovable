
import React, { createContext, useContext } from 'react';
import { AppData } from '@/data/types';
import { useAppsManager } from '@/hooks/useAppsManager';

interface AppsContextType {
  allApps: AppData[];
  setAllApps: (apps: AppData[]) => void; 
}

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export function AppsProvider({ children }: { children: React.ReactNode }) {
  const { allApps, setAllApps } = useAppsManager();

  return (
    <AppsContext.Provider value={{ 
      allApps, 
      setAllApps
    }}>
      {children}
    </AppsContext.Provider>
  );
}

export const useApps = () => {
  const context = useContext(AppsContext);
  if (context === undefined) {
    throw new Error('useApps must be used within an AppsProvider');
  }
  return context;
};
