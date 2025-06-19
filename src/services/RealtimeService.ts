
import { supabase } from '@/integrations/supabase/client';

// Configurar la tabla para cambios en tiempo real
export const configureRealtimeChanges = async () => {
  try {
    // Create a channel to listen for Postgres changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'apps'
        }, 
        (payload) => {
          console.log('Real-time update received for apps table:', payload);
        }
      )
      .subscribe();
    
    console.log('Configuración de tiempo real para apps activada');
    
    // Return the channel for potential cleanup
    return channel;
  } catch (error) {
    console.error('Error configurando tiempo real:', error);
  }
};

// Function to clean up real-time connection if needed
export const cleanupRealtimeConnection = async (channel: any) => {
  if (channel) {
    await supabase.removeChannel(channel);
  }
};
