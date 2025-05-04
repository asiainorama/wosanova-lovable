
// This file serves as a backward compatibility layer for existing imports
// It re-exports everything from appLibrary.ts

import { uniqueApps as allApps, aiApps, categories } from './appLibrary';
import { AppData } from './types';

// For backward compatibility - needed for any code that still references initialApps
export const initialApps = allApps;

// For backward compatibility - other export aliases that might be used elsewhere
export { allApps, aiApps, categories };

// Re-export the AppData type for convenience
export type { AppData };
