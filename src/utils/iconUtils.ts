import { AppData } from '@/data/apps';

const DEFAULT_ICON = "/placeholder.svg";
const BRANDFETCH_API_KEY = "aJ5lYIRJ+USZ1gYZaEjt9iNosNoWh4XtrLxTR1vsPHc=";
const ICON_CACHE_KEY = "app_icon_cache_v2";
const ICON_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Cache structure for storing icons with expiry times
interface IconCacheEntry {
  url: string;
  timestamp: number;
  source: string; // Track which source provided the icon
}

interface IconCache {
  [key: string]: IconCacheEntry;
}

/**
 * Fallback icons for known applications if API sources don't work
 */
const FALLBACK_ICONS: Record<string, string> = {
  // AI Apps
  "chatgpt": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  "claude": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Claude_Anthropic_Symbol.svg", 
  "gemini": "https://seeklogo.com/images/G/google-gemini-logo-12C7941017-seeklogo.com.png",
  "midjourney": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
  "dalle": "https://upload.wikimedia.org/wikipedia/commons/5/55/DALL-E_Logo.png",
  "stable-diffusion": "https://upload.wikimedia.org/wikipedia/commons/8/86/Stable_Diffusion_logo.png",
  "copilot": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Copilot_logo.svg",
  // Social Media & Communication
  "github": "https://github.githubassets.com/favicons/favicon.svg",
  "google": "https://www.google.com/favicon.ico",
  "youtube": "https://www.youtube.com/s/desktop/7c155e84/img/favicon_144x144.png",
  "facebook": "https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico",
  "instagram": "https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg",
  "twitter": "https://abs.twimg.com/responsive-web/client-web/icon-svg.168b89da.svg",
  "x": "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023.svg",
  "linkedin": "https://static.licdn.com/aero-v1/sc/h/akt4ae504epesldzj74dzred8",
  "gmail": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
  "whatsapp": "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  "telegram": "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
  "discord": "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg",
  "slack": "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_128.png",
  // Entertainment & Streaming
  "netflix": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  "spotify": "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg",
  "amazon": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  "prime-video": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.svg",
  "disney-plus": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
  "hbo-max": "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
  "twitch": "https://upload.wikimedia.org/wikipedia/commons/2/26/Twitch_logo.svg",
  "tiktok": "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
  // Productivity
  "microsoft": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  "apple": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  "dropbox": "https://upload.wikimedia.org/wikipedia/commons/4/47/Dropbox_logo_%282013-2020%29.svg",
  "notion": "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  "trello": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Trello-logo-blue.svg",
  "asana": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg",
  "evernote": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Evernote_logo_2018.svg",
  "office": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg",
  "google-docs": "https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg",
  "google-sheets": "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
  "google-slides": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Google_Slides_logo_%282014-2020%29.svg",
  "google-drive": "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
  // Finance
  "paypal": "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
  "venmo": "https://upload.wikimedia.org/wikipedia/commons/0/09/Venmo_logo.svg",
  "binance": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Binance-coin-bnb-logo.png",
  "coinbase": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Coinbase.svg",
  "robinhood": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Robinhood_Logo.svg",
  // Other
  "uber": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.svg",
  "airbnb": "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_logo_b%C3%A9lo.svg",
  "doordash": "https://upload.wikimedia.org/wikipedia/commons/0/0c/DoorDash_Logo.svg",
  "github-copilot": "https://logohistory.net/wp-content/uploads/2023/08/GitHub-Copilot-Symbol.png",
  
  // New additions
  "hyperwrite": "https://assets-global.website-files.com/60de2701a7b28f19ce5c8211/60de4efb8ce8a53964cce60b_hyperwrite-logo-symbol.svg",
  "jasper": "https://assets-global.website-files.com/60e7f99b504baaa72a6526d1/62b4fa0aad0a937b14090a57_jasper-logomark.svg",
  "leonardo": "https://leonardo.ai/favicon-32x32.png",
  "runway": "https://runwayml.com/images/favicon.png",
  "wordstream": "https://www.wordstream.com/wp-content/uploads/2022/03/favicon-32x32.png",
  "zapier": "https://cdn.zapier.com/zapier/images/favicon.png",
  "duolingo": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Duolingo_logo.svg",
  "simplify": "https://simplified.com/favicon.ico",
  "excel-online": "https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg",
  "word-online": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg",
  
  // New additions for better coverage
  "gitlab": "https://about.gitlab.com/images/press/logo/svg/gitlab-icon-rgb.svg",
  "mozilla": "https://www.mozilla.org/media/img/favicons/mozilla/favicon.d25d81d39065.ico",
  "firefox": "https://www.mozilla.org/media/img/favicons/firefox/favicon.4490e0b6e088.ico",
  "brave": "https://brave.com/static-assets/images/brave-favicon.png",
  "atlassian": "https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png",
  "jira": "https://wac-cdn.atlassian.com/assets/img/favicons/jira/favicon.png",
  "confluence": "https://wac-cdn.atlassian.com/assets/img/favicons/confluence/favicon.png",
  "bitbucket": "https://wac-cdn.atlassian.com/assets/img/favicons/bitbucket/favicon.png",
  "trustpilot": "https://consumer-cdn.trustpilot.net/_static/img/favicons/favicon-32x32.png",
  "postman": "https://www.postman.com/_ar-assets/images/favicon-32x32.png",
  "figma": "https://static.figma.com/app/icon/1/favicon.png",
  "adobe": "https://www.adobe.com/favicon.ico",
  "behance": "https://a5.behance.net/eb768b9269feaa27efb2bbc5edcd221a72adee46/img/site/favicon.ico?cb=264615658",
  "dribbble": "https://cdn.dribbble.com/assets/favicon-b38525134603b9513174ec887944bde1a869eb6cd414f4d640ee48ab2a15a26b.ico",
  "medium": "https://medium.com/favicon.ico",
  "quora": "https://qsf.cf2.quoracdn.net/-4-images.favicon-new.ico-26-07801c508fefc33a.ico",
  "stackoverflow": "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico?v=ec617d715196",
  "producthunt": "https://ph-static.imgix.net/ph-favicon-coral.ico",
  "kaggle": "https://www.kaggle.com/static/images/favicon.ico",
  "openai": "https://openai.com/favicon.ico",
  "vercel": "https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico",
  "supabase": "https://supabase.com/favicon/favicon.ico",
  "stripe": "https://stripe.com/img/v3/home/twitter.png",
  "shopify": "https://cdn.shopify.com/static/shopify-favicon.png",
  "etsy": "https://www.etsy.com/images/favicon.ico",
  "moz": "https://moz.com/favicon.ico",
  "hubspot": "https://www.hubspot.com/favicon.ico",
  "mailchimp": "https://mailchimp.com/release/plums/cxp/images/favicon.8693489eeb48.ico",
  "sendgrid": "https://sendgrid.com/favicon.ico",
  "notion-app": "https://www.notion.so/front-static/favicon.ico",
};

/**
 * Sources for icon discovery, from highest to lowest quality/reliability
 * Each source is a function that takes a domain and returns a URL
 */
const ICON_SOURCES = [
  // Official brand domains with common paths (high quality)
  (domain: string) => `https://${domain}/branding/logo.svg`,
  (domain: string) => `https://${domain}/assets/logo.svg`, 
  (domain: string) => `https://${domain}/assets/images/logo.svg`,
  (domain: string) => `https://${domain}/img/logo.svg`,
  
  // Common favicon locations (medium quality)
  (domain: string) => `https://${domain}/favicon.svg`,
  (domain: string) => `https://${domain}/favicon-32x32.png`,
  (domain: string) => `https://${domain}/favicon.png`,
  (domain: string) => `https://${domain}/favicon.ico`,
  
  // Apple touch icons (usually higher resolution)
  (domain: string) => `https://${domain}/apple-touch-icon.png`,
  (domain: string) => `https://${domain}/apple-touch-icon-precomposed.png`,
  
  // Common subdirectories
  (domain: string) => `https://${domain}/static/favicon.ico`,
  (domain: string) => `https://${domain}/assets/favicon.ico`,
  (domain: string) => `https://${domain}/images/favicon.ico`,
  (domain: string) => `https://${domain}/img/favicon.ico`,
  
  // External service APIs (more reliable fallbacks)
  (domain: string) => `https://logo.clearbit.com/${domain}?size=128`,
  (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  (domain: string) => `https://icon.horse/icon/${domain}?size=large`
];

/**
 * Load the icon cache from localStorage
 */
const loadIconCache = (): IconCache => {
  try {
    const cachedData = localStorage.getItem(ICON_CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.warn('Failed to load icon cache:', error);
  }
  return {};
};

/**
 * Save the icon cache to localStorage
 */
const saveIconCache = (cache: IconCache): void => {
  try {
    localStorage.setItem(ICON_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save icon cache:', error);
  }
};

/**
 * Clean expired entries from the cache
 */
const cleanExpiredCache = (cache: IconCache): IconCache => {
  const now = Date.now();
  const freshCache: IconCache = {};
  
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp < ICON_CACHE_EXPIRY) {
      freshCache[key] = cache[key];
    }
  });
  
  return freshCache;
};

// Initialize cache from localStorage
let iconCache = loadIconCache();
// Clean expired entries
iconCache = cleanExpiredCache(iconCache);
// Save cleaned cache back to storage
saveIconCache(iconCache);

/**
 * Extract the domain from a URL
 */
const extractDomain = (url: string): string => {
  try {
    // Remove protocol and path
    return url.replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0];
  } catch (error) {
    console.error('Error extracting domain:', error);
    return '';
  }
};

/**
 * Fetches icon from Brandfetch API
 * @param domain Domain to fetch icon for
 * @returns Promise with icon URL or null if not found
 */
const fetchBrandfetchIcon = async (domain: string): Promise<string | null> => {
  try {
    // Check if we have this in cache
    const cacheKey = `brandfetch_${domain}`;
    if (iconCache[cacheKey]) {
      return iconCache[cacheKey].url;
    }
    
    // Avoid making too many requests if we're getting rate limited
    if (window.localStorage.getItem('brandfetch_rate_limited') === 'true') {
      const timestamp = Number(window.localStorage.getItem('brandfetch_rate_limit_time') || '0');
      if (timestamp > Date.now() - 300000) { // 5 minutes
        return null;
      } else {
        window.localStorage.removeItem('brandfetch_rate_limited');
      }
    }

    console.log(`Fetching Brandfetch icon for ${domain}`);
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BRANDFETCH_API_KEY}`,
      },
    });

    if (response.status === 429) {
      console.warn(`Brandfetch API rate limited for ${domain}`);
      window.localStorage.setItem('brandfetch_rate_limited', 'true');
      window.localStorage.setItem('brandfetch_rate_limit_time', Date.now().toString());
      return null;
    }

    if (!response.ok) {
      console.warn(`Brandfetch API error for ${domain}:`, response.status);
      return null;
    }

    const data = await response.json();
    
    // Try to find a logo in the response
    if (data.logos && data.logos.length > 0) {
      // Look for vector format first (svg)
      const vectorLogo = data.logos.find((logo: any) => 
        logo.formats && logo.formats.find((format: any) => format.format === 'svg')
      );
      
      if (vectorLogo && vectorLogo.formats) {
        const svgFormat = vectorLogo.formats.find((format: any) => format.format === 'svg');
        if (svgFormat && svgFormat.src) {
          // Cache the result
          iconCache[cacheKey] = {
            url: svgFormat.src,
            timestamp: Date.now(),
            source: 'brandfetch-svg'
          }; 
          saveIconCache(iconCache);
          return svgFormat.src;
        }
      }
      
      // If no vector, take the first logo with any format
      for (const logo of data.logos) {
        if (logo.formats && logo.formats.length > 0 && logo.formats[0].src) {
          // Cache the result
          iconCache[cacheKey] = {
            url: logo.formats[0].src,
            timestamp: Date.now(),
            source: 'brandfetch-logo'
          };
          saveIconCache(iconCache);
          return logo.formats[0].src;
        }
      }
    }
    
    // If no logos, try to find an icon
    if (data.icons && data.icons.length > 0) {
      for (const icon of data.icons) {
        if (icon.formats && icon.formats.length > 0 && icon.formats[0].src) {
          // Cache the result
          iconCache[cacheKey] = {
            url: icon.formats[0].src,
            timestamp: Date.now(),
            source: 'brandfetch-icon'
          };
          saveIconCache(iconCache);
          return icon.formats[0].src;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Brandfetch icon for ${domain}:`, error);
    return null;
  }
};

/**
 * Try to extract icons from page metadata via a proxy fetch
 * @param domain Domain to fetch metadata for
 * @returns Promise with icon URL or null if not found
 */
const extractSiteMetadata = async (domain: string): Promise<string | null> => {
  try {
    const cacheKey = `metadata_${domain}`;
    if (iconCache[cacheKey]) {
      return iconCache[cacheKey].url;
    }

    // Using cors-anywhere or similar proxy is not ideal for production
    // This is a simplified approach - consider using a server function in production
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://${domain}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      // Set a timeout to avoid waiting too long
      signal: AbortSignal.timeout(5000)
    }).catch(err => {
      console.log(`Metadata fetch failed for ${domain}:`, err);
      return null;
    });
    
    if (!response || !response.ok) return null;
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for favicon link tags - prioritize by size and format
    const iconLinks = Array.from(doc.querySelectorAll('link[rel*="icon"]'));
    const sortedIcons = iconLinks
      .map(link => ({
        href: link.getAttribute('href'),
        sizes: link.getAttribute('sizes') || '',
        type: link.getAttribute('type') || ''
      }))
      .filter(icon => icon.href)
      .sort((a, b) => {
        // Prefer svg
        if (a.type === 'image/svg+xml' && b.type !== 'image/svg+xml') return -1;
        if (b.type === 'image/svg+xml' && a.type !== 'image/svg+xml') return 1;
        
        // Then consider size - extract numbers from sizes attribute
        const aSize = a.sizes ? parseInt(a.sizes.split('x')[0]) : 0;
        const bSize = b.sizes ? parseInt(b.sizes.split('x')[0]) : 0;
        return bSize - aSize; // Larger first
      });
    
    if (sortedIcons.length > 0) {
      let iconUrl = sortedIcons[0].href || '';
      
      // Make relative URLs absolute
      if (iconUrl && !iconUrl.startsWith('http')) {
        if (iconUrl.startsWith('/')) {
          iconUrl = `https://${domain}${iconUrl}`;
        } else {
          iconUrl = `https://${domain}/${iconUrl}`;
        }
      }
      
      // Cache the result
      iconCache[cacheKey] = {
        url: iconUrl,
        timestamp: Date.now(),
        source: 'metadata-favicon'
      };
      saveIconCache(iconCache);
      return iconUrl;
    }
    
    // Check for Open Graph image
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.getAttribute('content')) {
      const ogImageUrl = ogImage.getAttribute('content') || '';
      
      // Cache the result
      iconCache[cacheKey] = {
        url: ogImageUrl,
        timestamp: Date.now(),
        source: 'metadata-og'
      };
      saveIconCache(iconCache);
      return ogImageUrl;
    }
    
    return null;
  } catch (error) {
    console.error(`Error extracting metadata for ${domain}:`, error);
    return null;
  }
};

/**
 * Attempts to fetch a company logo from different sources
 * @param domain The domain to fetch the logo for
 * @returns Promise with the logo URL or null if not found
 */
const fetchLogoFromExternalSources = async (domain: string): Promise<string | null> => {
  // Check cache first
  const cacheKey = `external_${domain}`;
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey].url;
  }
  
  // For each source, try to get a valid image
  for (const getIconUrl of ICON_SOURCES) {
    try {
      const iconUrl = getIconUrl(domain);
      const isValid = await isValidImage(iconUrl);
      if (isValid) {
        // Cache the result
        iconCache[cacheKey] = {
          url: iconUrl,
          timestamp: Date.now(),
          source: 'external-source'
        };
        saveIconCache(iconCache);
        return iconUrl;
      }
    } catch (error) {
      continue; // Try the next API if this one fails
    }
  }
  
  return null;
};

/**
 * Tries to get a valid icon URL for an app
 * @param app App data
 * @returns URL of the icon or default image
 */
export const getValidIconUrl = (app: AppData): string => {
  // If the app already has a valid icon (not a placeholder), use it
  if (app.icon && !app.icon.includes('placeholder')) {
    return app.icon;
  }
  
  // If we have a fallback for this app, use it
  if (app.id && FALLBACK_ICONS[app.id]) {
    return FALLBACK_ICONS[app.id];
  }
  
  // Get a lowercase domain for consistent checks
  const domain = extractDomain(app.url);
  
  // For specific categories, try different approaches (customize as needed)
  if (app.category === 'Redes Sociales') {
    // For social media, Google's favicon service often works well
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  
  // Default to Clearbit which has good coverage
  return `https://logo.clearbit.com/${domain}`;
};

/**
 * Verifies if an image URL is valid by trying to load it
 * @param url URL to verify
 * @returns Promise with a boolean indicating if the image is valid
 */
export const isValidImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, 3000); // 3 second timeout for image loading
    
    img.onload = () => {
      clearTimeout(timeoutId);
      // Check if the image has actual dimensions
      if (img.naturalWidth > 1 && img.naturalHeight > 1) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    img.src = url;
  });
};

/**
 * Get statistics about icon loading success
 */
const getIconStats = (): { total: number; cached: number; sources: Record<string, number> } => {
  const stats = {
    total: 0,
    cached: 0,
    sources: {} as Record<string, number>
  };
  
  stats.total = Object.keys(iconCache).length;
  
  Object.values(iconCache).forEach(entry => {
    if (Date.now() - entry.timestamp < ICON_CACHE_EXPIRY) {
      stats.cached++;
      
      // Count by source
      if (!stats.sources[entry.source]) {
        stats.sources[entry.source] = 1;
      } else {
        stats.sources[entry.source]++;
      }
    }
  });
  
  return stats;
};

/**
 * Fixes icons for a list of apps using multiple sources and fallbacks
 * @param apps List of apps
 * @returns List of apps with fixed icons
 */
export const fixAppIcons = async (apps: AppData[]): Promise<AppData[]> => {
  const appsWithIcons = [];
  const startTime = performance.now();
  let successCount = 0;
  let fallbackCount = 0;
  
  for (const app of apps) {
    let iconUrl = app.icon;
    let iconSource = 'original';
    
    // Skip if the icon is already valid and not a placeholder
    if (iconUrl && !iconUrl.includes('placeholder') && await isValidImage(iconUrl)) {
      appsWithIcons.push(app);
      successCount++;
      continue;
    }
    
    try {
      const domain = extractDomain(app.url);
      
      // 1. First try our hardcoded fallbacks (highest quality)
      if (app.id && FALLBACK_ICONS[app.id]) {
        iconUrl = FALLBACK_ICONS[app.id];
        iconSource = 'fallback';
        fallbackCount++;
      } 
      // 2. Then check if we have it in cache
      else {
        const cacheKey = domain;
        if (iconCache[cacheKey]) {
          iconUrl = iconCache[cacheKey].url;
          iconSource = 'cache';
          successCount++;
        }
        // 3. Try Brandfetch API (good quality but rate limited)
        else {
          const brandfetchIcon = await fetchBrandfetchIcon(domain);
          
          if (brandfetchIcon) {
            iconUrl = brandfetchIcon;
            iconSource = 'brandfetch';
            successCount++;
          } 
          // 4. Try to extract from website metadata
          else {
            const metadataIcon = await extractSiteMetadata(domain).catch(() => null);
            
            if (metadataIcon) {
              iconUrl = metadataIcon;
              iconSource = 'metadata';
              successCount++;
            }
            // 5. Try common icon paths and external services
            else {
              const externalIcon = await fetchLogoFromExternalSources(domain);
              
              if (externalIcon) {
                iconUrl = externalIcon;
                iconSource = 'external';
                successCount++;
              } else {
                // 6. Last resort is our getValidIconUrl function
                iconUrl = getValidIconUrl(app);
                iconSource = 'fallback';
                fallbackCount++;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching icon for', app.name, error);
      iconUrl = getValidIconUrl(app);
      iconSource = 'error-fallback';
    }
    
    // Verify the icon is valid before setting it
    let isValid = await isValidImage(iconUrl);
    
    // If not valid and we haven't tried Google yet, use Google as last resort
    if (!isValid && !iconUrl.includes('google.com/s2')) {
      const domain = extractDomain(app.url);
      iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      isValid = await isValidImage(iconUrl);
      iconSource = 'google-fallback';
    }
    
    appsWithIcons.push({
      ...app,
      icon: isValid ? iconUrl : DEFAULT_ICON
    });
  }
  
  const endTime = performance.now();
  const stats = getIconStats();
  
  console.log(`Icon processing completed in ${Math.round(endTime - startTime)}ms. Success: ${successCount}, Fallback: ${fallbackCount}`);
  console.log(`Icon cache stats:`, stats);
  
  return appsWithIcons;
};

/**
 * Preload icons for commonly used apps to have them ready
 * @param limit Maximum number of apps to preload (defaults to 10)
 */
export const preloadCommonAppIcons = async (apps: AppData[], limit: number = 10): Promise<void> => {
  // Get a subset of the most important apps to preload
  const appsToPreload = apps.slice(0, limit);
  
  console.log(`Preloading icons for ${appsToPreload.length} common apps`);
  
  // Process in the background
  setTimeout(async () => {
    await fixAppIcons(appsToPreload);
  }, 1000);
};
