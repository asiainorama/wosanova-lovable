
import { fetchAppsFromSupabase, saveAppToSupabase } from '@/services/AppsService';

/**
 * Función para sincronizar todas las aplicaciones estáticas con Supabase.
 * Esta función puede ejecutarse manualmente desde la consola del navegador.
 */
export const syncAllAppsToSupabase = async () => {
  // First, fetch the current apps from Supabase
  console.log(`Iniciando sincronización de aplicaciones con Supabase...`);
  
  try {
    const allApps = await fetchAppsFromSupabase();
    console.log(`Obtenidas ${allApps.length} aplicaciones desde Supabase.`);
    
    const results = {
      success: 0,
      errors: 0
    };
    
    for (const app of allApps) {
      try {
        await saveAppToSupabase(app);
        console.log(`✓ App sincronizada: ${app.name}`);
        results.success++;
      } catch (error) {
        console.error(`✗ Error sincronizando app ${app.name}:`, error);
        results.errors++;
      }
    }
    
    console.log(`Sincronización completa: ${results.success} exitosas, ${results.errors} errores`);
    return results;
  } catch (error) {
    console.error("Error fetching apps from Supabase:", error);
    return {
      success: 0,
      errors: 1
    };
  }
};

// Exportar la función para que esté disponible en la consola del navegador
// SIEMPRE disponible, incluso antes de la carga del componente Admin
if (typeof window !== 'undefined') {
  (window as any).syncAllAppsToSupabase = syncAllAppsToSupabase;
  console.log('====================================');
  console.log('Para sincronizar todas las aplicaciones con Supabase:');
  console.log('1. Asegúrate de estar autenticado como administrador');
  console.log('2. Abre la consola del navegador (F12 o Ctrl+Shift+I)');
  console.log('3. Ejecuta: syncAllAppsToSupabase()');
  console.log('====================================');
}
