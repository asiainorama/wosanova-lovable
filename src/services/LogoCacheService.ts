
import { AppData } from '@/data/apps';
import { fixAppIcons, isValidImage } from '@/utils/iconUtils';
import { toast } from 'sonner';
import { isIOSOrMacOS, isSafariBrowser } from '@/hooks/iconLoading';

const LOGO_CACHE_KEY = 'logo_cache_v3';
const SESSION_LOGOS_KEY = 'session_logos_v3'; // Incrementing version to force refresh
const SAFARI_LOGOS_KEY = 'safari_logos_v1'; // Safari-specific cache
const LOGO_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours cache expiry

// Memory cache for fast access
let sessionLogos: Record<string, { url: string, domain: string }> = {};
let safariLogos: Record<string, { url: string, domain: string, timestamp: number }> = {};

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
    
    // Safari-specific: load Safari logos from localStorage for better persistence
    if (isSafariBrowser()) {
      const safariData = localStorage.getItem(SAFARI_LOGOS_KEY);
      if (safariData) {
        safariLogos = JSON.parse(safariData);
        console.log(`Loaded ${Object.keys(safariLogos).length} Safari-specific logos`);
        
        // Add valid Safari logos to the session cache
        Object.entries(safariLogos).forEach(([appId, entry]) => {
          if (entry.url && entry.domain && (Date.now() - entry.timestamp < LOGO_CACHE_EXPIRY)) {
            sessionLogos[appId] = {
              url: entry.url,
              domain: entry.domain
            };
          }
        });
        
        // Update session storage with combined data
        sessionStorage.setItem(SESSION_LOGOS_KEY, JSON.stringify(sessionLogos));
      } else {
        safariLogos = {};
      }
    }
  } catch (e) {
    console.error('Error loading session logos:', e);
    sessionLogos = {};
    safariLogos = {};
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
export const getCachedLogo = (app: AppData, isSafari = false): string => {
  // Use the app's icon if it exists and isn't a placeholder
  if (app.icon && !app.icon.includes('placeholder')) {
    return app.icon;
  }
  
  // For Safari browsers, check Safari-specific cache first
  if (isSafari && safariLogos[app.id]?.url) {
    return safariLogos[app.id].url;
  }
  
  // Check session cache next (memory and sessionStorage)
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
  if (isSafari || isIOSOrMacOS()) {
    try {
      const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      // Use Google's favicon service which is more reliable for Safari
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
  
  // Add to Safari-specific cache if on Safari
  if (isSafariBrowser()) {
    safariLogos[appId] = {
      url,
      domain,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(SAFARI_LOGOS_KEY, JSON.stringify(safariLogos));
    } catch (e) {
      console.warn('Error saving Safari logo cache:', e);
    }
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
  const isSafari = isSafariBrowser();
  
  if ((safariSpecific && isIOSOrMacOS()) || isSafari) {
    console.log("Prefetching icons specifically for Safari/iOS/macOS");
    
    for (const app of apps) {
      try {
        const domain = app.url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
        
        // Try different services that work well with Safari
        const sources = [
          `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          `https://icon.horse/icon/${domain}?size=large`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
          `https://api.faviconkit.com/${domain}/128`,
          `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${app.url}&size=128`,
          `https://logo.clearbit.com/${domain}`
        ];
        
        let foundValid = false;
        
        // Try each source in sequence
        for (const source of sources) {
          if (foundValid) break;
          
          try {
            const isValid = await isValidImage(source);
            if (isValid) {
              registerSuccessfulLogo(app.id, source, domain);
              // Add to Safari cache
              safariLogos[app.id] = {
                url: source,
                domain,
                timestamp: Date.now()
              };
              foundValid = true;
            }
          } catch (err) {
            continue; // Try next source
          }
        }
        
        // Persist Safari cache after processing each batch
        if (Object.keys(safariLogos).length > 0) {
          localStorage.setItem(SAFARI_LOGOS_KEY, JSON.stringify(safariLogos));
        }
      } catch (e) {
        console.warn(`Error prefetching Safari icon for ${app.name}:`, e);
      }
    }
    
    if (!silent) {
      toast.success('Iconos precargados correctamente para Safari');
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
    
    // Also persist Safari logos if relevant
    if (isSafariBrowser() && Object.keys(safariLogos).length > 0) {
      localStorage.setItem(SAFARI_LOGOS_KEY, JSON.stringify(safariLogos));
      console.log(`Persisted ${Object.keys(safariLogos).length} Safari-specific logos`);
    }
  } catch (e) {
    console.error('Error persisting logo cache:', e);
  }
};

// Save all logos to localStorage when window is unloaded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', persistAllLogos);
}
