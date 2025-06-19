
// Re-export CRUD operations for backward compatibility
export {
  fetchAppsFromSupabase,
  saveAppToSupabase,
  deleteAppFromSupabase,
  deleteAllAppsFromSupabase
} from './AppsCrudService';

// Re-export realtime functionality
export {
  configureRealtimeChanges,
  cleanupRealtimeConnection
} from './RealtimeService';

// Initialize realtime connection when module loads
import { configureRealtimeChanges } from './RealtimeService';

const realtimeChannel = configureRealtimeChanges();

// Export for potential cleanup
export { realtimeChannel };
