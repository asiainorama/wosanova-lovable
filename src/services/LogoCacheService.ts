/**
 * Logo Cache Service
 * 
 * A multi-layered caching system for app logos that ensures 
 * persistence and fast retrieval across sessions.
 */
import { AppData } from '@/data/apps';

// Cache version - increment when making breaking changes to cache structure
const CACHE_VERSION = 'logo-cache-v1';

// Storage keys
const LOCAL_STORAGE_KEY = `${CACHE_VERSION}-persistent`;
const SESSION_STORAGE_KEY = `${CACHE_VERSION}-session`;
const METADATA_KEY = `${CACHE_VERSION}-metadata`;

// Cache entry expiry (30 days in ms)
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000;

// Default placeholder when no image is found
const DEFAULT_ICON = "/placeholder.svg";

// Cache entry with validation and metadata
interface LogoCacheEntry {
  appId: string;        // App ID for reference
  url: string;          // The actual logo URL
  timestamp: number;    // When this cache entry was created
  validated: boolean;   // Whether this URL was validated as working
  domain: string;       // Domain associated with the app
  source: string;       // Source of the logo (api, fallback, etc)
}

// In-memory cache (fastest access)
const memoryCache: Map<string, LogoCacheEntry> = new Map();

/**
 * Extract domain from URL
 */
const extractDomain = (url: string): string => {
  try {
    return url.replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0];
  } catch (error) {
    console.error('Error extracting domain:', error);
    return '';
  }
};

/**
 * Save metadata about the cache
 */
const saveMetadata = () => {
  try {
    const metadata = {
      version: CACHE_VERSION,
      lastUpdated: Date.now(),
      entryCount: {
        memory: memoryCache.size,
        session: countSessionEntries(),
        local: countLocalEntries()
      }
    };
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (e) {
    console.warn('Failed to save cache metadata:', e);
  }
};

/**
 * Count entries in session storage
 */
const countSessionEntries = (): number => {
  try {
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) return 0;
    return Object.keys(JSON.parse(sessionData)).length;
  } catch (e) {
    return 0;
  }
};

/**
 * Count entries in local storage
 */
const countLocalEntries = (): number => {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localData) return 0;
    return Object.keys(JSON.parse(localData)).length;
  } catch (e) {
    return 0;
  }
};

/**
 * Load cached logos from persistent storage into memory
 * Called on service initialization
 */
const initializeCaches = (): void => {
  console.log('Initializing logo cache service...');
  
  // Load from session storage first (current session's validated icons)
  try {
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      const sessionEntries: Record<string, LogoCacheEntry> = JSON.parse(sessionData);
      Object.values(sessionEntries).forEach(entry => {
        if (entry && entry.url && entry.validated) {
          memoryCache.set(entry.appId, entry);
        }
      });
      console.log(`Loaded ${memoryCache.size} validated logos from session storage`);
    }
  } catch (e) {
    console.warn('Error loading session cache:', e);
  }
  
  // Then supplement with localStorage for any missing entries
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const localEntries: Record<string, LogoCacheEntry> = JSON.parse(localData);
      
      let loadedCount = 0;
      Object.values(localEntries).forEach(entry => {
        // Only load entries not already in memory and that aren't expired
        if (
          entry && 
          entry.url && 
          !memoryCache.has(entry.appId) && 
          Date.now() - entry.timestamp < CACHE_EXPIRY
        ) {
          memoryCache.set(entry.appId, entry);
          loadedCount++;
        }
      });
      
      console.log(`Loaded ${loadedCount} additional logos from local storage`);
    }
  } catch (e) {
    console.warn('Error loading local cache:', e);
  }
  
  // Persist current memory state to session storage
  persistMemoryToSession();
  
  // Update metadata
  saveMetadata();
};

/**
 * Validate if an image URL is working by attempting to load it
 */
const validateImageUrl = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url || url.includes('placeholder')) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, 3000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img.naturalWidth > 1 && img.naturalHeight > 1);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    img.src = url;
  });
};

/**
 * Save memory cache to session storage
 */
const persistMemoryToSession = (): void => {
  try {
    const entries: Record<string, LogoCacheEntry> = {};
    memoryCache.forEach((entry, key) => {
      entries[key] = entry;
    });
    
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Failed to persist memory cache to session:', e);
  }
};

/**
 * Batch save important logos to local storage for persistence
 */
const persistToLocalStorage = (): void => {
  try {
    const currentEntries: Record<string, LogoCacheEntry> = {};
    
    // First try to load existing entries
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (existingData) {
        Object.assign(currentEntries, JSON.parse(existingData));
      }
    } catch (e) {
      console.warn('Error loading existing local cache during persist:', e);
    }
    
    // Get only validated entries from memory to persist
    let updatedCount = 0;
    memoryCache.forEach((entry, key) => {
      if (entry.validated) {
        currentEntries[key] = entry;
        updatedCount++;
      }
    });
    
    // Limit cache size if too large
    const entries = Object.entries(currentEntries);
    if (entries.length > 500) {
      // Keep most recent entries
      const sorted = entries.sort(([, a], [, b]) => b.timestamp - a.timestamp);
      const trimmed = sorted.slice(0, 500);
      const trimmedEntries = Object.fromEntries(trimmed);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmedEntries));
      console.log(`Trimmed local storage cache from ${entries.length} to 500 entries`);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentEntries));
      console.log(`Updated ${updatedCount} entries in local storage cache`);
    }
    
    saveMetadata();
  } catch (e) {
    console.error('Failed to persist to local storage:', e);
  }
};

/**
 * Get cached logo URL for an app
 * @param app The app to get a logo for
 * @returns The cached logo URL or default icon
 */
export const getCachedLogo = (app: AppData): string => {
  // Check in-memory cache first (fastest)
  if (memoryCache.has(app.id)) {
    const cached = memoryCache.get(app.id);
    if (cached && cached.url) {
      return cached.url;
    }
  }
  
  // If app already has a valid icon that's not a placeholder, use it
  if (app.icon && !app.icon.includes('placeholder')) {
    // Store this in our cache for future reference
    const domain = extractDomain(app.url);
    memoryCache.set(app.id, {
      appId: app.id,
      url: app.icon,
      timestamp: Date.now(),
      validated: false,  // Will be validated on use
      domain,
      source: 'app-data'
    });
    
    return app.icon;
  }
  
  // Return default if nothing found
  return DEFAULT_ICON;
};

/**
 * Register a successfully loaded logo
 * This confirms the logo works and should be cached permanently
 */
export const registerSuccessfulLogo = (
  appId: string, 
  logoUrl: string, 
  domain: string,
  source = 'validated'
): void => {
  if (!appId || !logoUrl || logoUrl.includes('placeholder')) return;

  // Update memory cache
  memoryCache.set(appId, {
    appId,
    url: logoUrl,
    timestamp: Date.now(),
    validated: true,
    domain,
    source
  });
  
  // Immediately persist to session storage
  persistMemoryToSession();
  
  // Periodically save to local storage (throttled)
  if (Math.random() < 0.1) { // 10% chance on each registration
    persistToLocalStorage();
  }
};

/**
 * Prefetch important app logos
 * @param apps List of apps to prefetch logos for
 */
export const prefetchAppLogos = async (apps: AppData[]): Promise<void> => {
  console.log(`Prefetching logos for ${apps.length} apps...`);
  
  // Process in small batches to avoid blocking the UI
  const batchSize = 10;
  let validatedCount = 0;

  for (let i = 0; i < apps.length; i += batchSize) {
    const batch = apps.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (app) => {
      try {
        // Start with what we already have
        let logoUrl = getCachedLogo(app);
        
        // If it's a placeholder, try the app's icon
        if (logoUrl === DEFAULT_ICON && app.icon) {
          logoUrl = app.icon;
        }
        
        // Validate the URL
        const isValid = await validateImageUrl(logoUrl);
        
        if (isValid) {
          const domain = extractDomain(app.url);
          registerSuccessfulLogo(app.id, logoUrl, domain, 'prefetch');
          validatedCount++;
        }
      } catch (e) {
        console.warn(`Error prefetching logo for ${app.name}:`, e);
      }
    }));
    
    // Small delay between batches to avoid blocking UI
    if (i + batchSize < apps.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Prefetch complete: ${validatedCount} logos validated`);
  
  // Save to persistent storage
  persistToLocalStorage();
};

/**
 * Force persist all current logo cache to local storage
 * Called when user navigates away or closes the app
 */
export const persistAllLogos = (): void => {
  console.log('Persisting all logo cache to storage...');
  persistToLocalStorage();
};

/**
 * Clear all caches (for testing or troubleshooting)
 */
export const clearLogoCache = (): void => {
  memoryCache.clear();
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(METADATA_KEY);
  } catch (e) {
    console.error('Error clearing caches:', e);
  }
};

// Initialize caches on service load
initializeCaches();

// Set up persistence when user leaves the page
window.addEventListener('beforeunload', persistAllLogos);
