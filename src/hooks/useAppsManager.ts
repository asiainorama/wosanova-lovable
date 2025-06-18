
import { useState, useEffect } from 'react';
import { AppData } from '@/data/types';
import { fetchAppsFromSupabase } from '@/services/AppsService';
import { supabase } from '@/integrations/supabase/client';

export const useAppsManager = () => {
  const [allApps, setAllApps] = useState<AppData[]>([]);

  useEffect(() => {
    const loadAppsFromSupabase = async () => {
      try {
        const appsFromSupabase = await fetchAppsFromSupabase();
        
        if (appsFromSupabase.length > 0) {
          console.log('Loaded apps from Supabase:', appsFromSupabase.length);
          setAllApps(appsFromSupabase);
        }
      } catch (error) {
        console.error('Error loading apps from Supabase:', error);
      }
    };
    
    loadAppsFromSupabase();
    
    // Subscribe to real-time changes
    const appsChannel = supabase
      .channel('public:apps')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'apps' },
        (payload) => {
          console.log('Realtime update received:', payload);
          loadAppsFromSupabase();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(appsChannel);
    };
  }, []);

  return { allApps, setAllApps };
};
