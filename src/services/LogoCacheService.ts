
import { AppData } from '@/data/apps';
import { fixAppIcons, isValidImage } from '@/utils/iconUtils';
import { toast } from 'sonner';
import { isIOSOrMacOS } from '@/hooks/iconLoading';

const LOGO_CACHE_KEY = 'logo_cache_v3';
const SESSION_LOGOS_KEY = 'session_logos_v2';
const LOGO_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours cache expiry

// Memory cache for fast access
let sessionLogos: Record<string, { url: string, domain: string }> = {};

/**
 * Initialize the logo cache service
 */
export const initLogoCacheService = (): void => {
  console.log('Initializing logo cache service...');
  
  // Load session logos
  try {
    const sessionData = sessionStorage.getItem(SESSION_LOGOS_KEY);
    if (sessionData) {
      sessionLogos = JSON.parse(sessionData);
      console.log(`Loaded ${Object.keys(sessionLogos).length} validated logos from session storage`);
    } else {
      sessionLogos = {};
    }
  } catch (e) {
    console.error('Error loading session logos:', e);
    sessionLogos = {};
  }
  
  // Load additional logos from localStorage for resilience
  try {
    const cacheData = localStorage.getItem(LOGO_CACHE_KEY);
    if (cacheData) {
      const logoCache = JSON.parse(cacheData);
      let count = 0;
      
      // Add valid entries to session cache
      Object.keys(logoCache).forEach(appId => {
        const entry = logoCache[appId];
        if (entry && entry.url && entry.timestamp && !sessionLogos[appId]) {
          // Skip expired entries
          if (Date.now() - entry.timestamp < LOGO_CACHE_EXPIRY) {
            sessionLogos[appId] = {
              url: entry.url,
              domain: entry.domain || ''
            };
            count++;
          }
        }
      });
      
      // Save to session storage for faster access
      if (count > 0) {
        sessionStorage.setItem(SESSION_LOGOS_KEY, JSON.stringify(sessionLogos));
        console.log(`Loaded ${count} additional logos from local storage`);
      }
    }
  } catch (e) {
    console.error('Error loading logo cache:', e);
  }
};

// Auto-initialize
initLogoCacheService();

/**
 * Get a cached logo URL for an app
 */
export const getCachedLogo = (app: AppData): string => {
  // Use the app's icon if it exists
  if (app.icon && !app.icon.includes('placeholder')) {
    return app.icon;
  }
  
  // Check session cache first (memory and sessionStorage)
  if (sessionLogos[app.id]?.url) {
    return sessionLogos[app.id].url;
  }
  
  // Check persistent cache
  try {
    const cacheData = localStorage.getItem(LOGO_CACHE_KEY);
    if (cacheData) {
      const logoCache = JSON.parse(cacheData);
      const entry = logoCache[app.id];
      
      if (entry && entry.url && entry.timestamp) {
        // Check if cache is still valid
        if (Date.now() - entry.timestamp < LOGO_CACHE_EXPIRY) {
          // Add to session cache for faster access next time
          sessionLogos[app.id] = {
            url: entry.url,
            domain: entry.domain || ''
          };
          sessionStorage.setItem(SESSION_LOGOS_KEY, JSON.stringify(sessionLogos));
          
          return entry.url;
        }
      }
    }
  } catch (e) {
    console.error('Error accessing logo cache:', e);
  }
  
  // Use domain-based fallbacks for Safari
  if (isIOSOrMacOS()) {
    try {
      const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      console.warn('Error generating fallback icon:', e);
    }
  }
  
  // Return app icon as fallback
  return app.icon || '/placeholder.svg';
};

/**
 * Register a successful logo
 */
export const registerSuccessfulLogo = (
  appId: string,
  url: string,
  domain: string
): void => {
  if (!url || url.includes('placeholder')) return;
  
  // Add to session cache
  sessionLogos[appId] = {
    url,
    domain: domain || ''
  };
  
  try {
    sessionStorage.setItem(SESSION_LOGOS_KEY, JSON.stringify(sessionLogos));
  } catch (e) {
    console.warn('Error saving to session storage:', e);
  }
  
  // Add to persistent cache
  try {
    const cacheData = localStorage.getItem(LOGO_CACHE_KEY);
    const logoCache = cacheData ? JSON.parse(cacheData) : {};
    
    logoCache[appId] = {
      url,
      domain,
      timestamp: Date.now()
    };
    
    // Save occasionally to reduce writes
    const shouldSave = Math.random() < 0.25; // 25% chance to save
    if (shouldSave) {
      localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(logoCache));
      console.log('Persisting logo cache to storage...');
      
      // Clean up old entries before saving
      let updatedCount = 0;
      Object.keys(logoCache).forEach(key => {
        const entry = logoCache[key];
        if (entry && entry.timestamp && Date.now() - entry.timestamp > LOGO_CACHE_EXPIRY) {
          delete logoCache[key];
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        console.log(`Updated ${updatedCount} entries in local storage cache`);
      }
    }
  } catch (e) {
    console.warn('Error saving to logo cache:', e);
  }
};

/**
 * Prefetch app logos
 */
export const prefetchAppLogos = async (
  apps: AppData[],
  silent: boolean = false,
  safariSpecific: boolean = false
): Promise<void> => {
  // Special path for Safari
  if (safariSpecific && isIOSOrMacOS()) {
    for (const app of apps) {
      try {
        const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
        
        // Try different services that work well with Safari
        const sources = [
          `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          `https://icon.horse/icon/${domain}?size=large`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
          `https://api.faviconkit.com/${domain}/128`,
          `https://logo.clearbit.com/${domain}`
        ];
        
        for (const source of sources) {
          const isValid = await isValidImage(source);
          if (isValid) {
            registerSuccessfulLogo(app.id, source, domain);
            break;
          }
        }
      } catch (e) {
        console.warn(`Error prefetching Safari icon for ${app.name}:`, e);
      }
    }
    return;
  }

  // Standard path for icon prefetching
  if (!silent) {
    toast.loading('Precargando iconos...');
  }
  
  try {
    await fixAppIcons(apps);
    
    if (!silent) {
      toast.success('Iconos precargados correctamente');
    }
  } catch (e) {
    console.error('Error prefetching icons:', e);
    
    if (!silent) {
      toast.error('Error al precargar los iconos');
    }
  }
};

/**
 * Explicitly save all cached logos to localStorage
 */
export const persistAllLogos = (): void => {
  try {
    console.log('Persisting all logo cache to storage...');
    
    const cacheData = localStorage.getItem(LOGO_CACHE_KEY);
    const logoCache = cacheData ? JSON.parse(cacheData) : {};
    
    // Add all session logos to the persistent cache
    let updateCount = 0;
    Object.keys(sessionLogos).forEach(appId => {
      const sessionLogo = sessionLogos[appId];
      if (sessionLogo && sessionLogo.url) {
        logoCache[appId] = {
          url: sessionLogo.url,
          domain: sessionLogo.domain || '',
          timestamp: Date.now()
        };
        updateCount++;
      }
    });
    
    localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(logoCache));
    console.log(`Updated ${updateCount} entries in local storage cache`);
  } catch (e) {
    console.error('Error persisting logo cache:', e);
  }
};

// Save all logos to localStorage when window is unloaded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', persistAllLogos);
}
