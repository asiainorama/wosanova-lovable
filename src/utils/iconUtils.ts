import { AppData } from '@/data/apps';

const DEFAULT_ICON = "/placeholder.svg";
const BRANDFETCH_API_KEY = "aJ5lYIRJ+USZ1gYZaEjt9iNosNoWh4XtrLxTR1vsPHc=";

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
};

/**
 * Additional icon sources to try if default ones fail
 */
const ICON_APIS = [
  // Function to get Clearbit icon
  (domain: string) => `https://logo.clearbit.com/${domain}`,
  // Function to get Logo.dev icon
  (domain: string) => `https://api.logo.dev/v1/company?domain=${domain}`,
  // Function to get direct favicon
  (domain: string) => `https://${domain}/favicon.ico`,
  // Function to get alternative favicon
  (domain: string) => `https://${domain}/favicon.png`,
  // Function to get touch icon
  (domain: string) => `https://${domain}/apple-touch-icon.png`,
  // Function to get google icons
  (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
];

/**
 * Fetches icon from Brandfetch API
 * @param domain Domain to fetch icon for
 * @returns Promise with icon URL or null if not found
 */
const fetchBrandfetchIcon = async (domain: string): Promise<string | null> => {
  try {
    // Avoid making too many requests if we're getting rate limited
    if (window.localStorage.getItem('brandfetch_rate_limited') === 'true') {
      const timestamp = Number(window.localStorage.getItem('brandfetch_rate_limit_time') || '0');
      if (timestamp > Date.now() - 300000) { // 5 minutes
        return null;
      } else {
        window.localStorage.removeItem('brandfetch_rate_limited');
      }
    }

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
          return svgFormat.src;
        }
      }
      
      // If no vector, take the first logo with any format
      for (const logo of data.logos) {
        if (logo.formats && logo.formats.length > 0 && logo.formats[0].src) {
          return logo.formats[0].src;
        }
      }
    }
    
    // If no logos, try to find an icon
    if (data.icons && data.icons.length > 0) {
      for (const icon of data.icons) {
        if (icon.formats && icon.formats.length > 0 && icon.formats[0].src) {
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
 * Attempts to fetch a company logo from different sources
 * @param domain The domain to fetch the logo for
 * @returns Promise with the logo URL or null if not found
 */
const fetchLogoFromExternalSources = async (domain: string): Promise<string | null> => {
  // For each source, try to get a valid image
  for (const getIconUrl of ICON_APIS) {
    const iconUrl = getIconUrl(domain);
    const isValid = await isValidImage(iconUrl);
    if (isValid) {
      return iconUrl;
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
  const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
  
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
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Fixes icons for a list of apps using multiple sources and fallbacks
 * @param apps List of apps
 * @returns List of apps with fixed icons
 */
export const fixAppIcons = async (apps: AppData[]): Promise<AppData[]> => {
  const appsWithIcons = [];
  
  for (const app of apps) {
    let iconUrl = app.icon;
    
    // If no icon, or current icon is placeholder, try to get a better one
    if (!iconUrl || iconUrl.includes('placeholder')) {
      try {
        const domain = app.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
        
        // First try our hardcoded fallbacks (highest quality)
        if (app.id && FALLBACK_ICONS[app.id]) {
          iconUrl = FALLBACK_ICONS[app.id];
        } 
        // Then try Brandfetch API
        else {
          const brandfetchIcon = await fetchBrandfetchIcon(domain);
          
          if (brandfetchIcon) {
            iconUrl = brandfetchIcon;
          } 
          // If Brandfetch doesn't work, try other icon sources
          else {
            const externalIcon = await fetchLogoFromExternalSources(domain);
            
            if (externalIcon) {
              iconUrl = externalIcon;
            } else {
              // Last resort is our getValidIconUrl function
              iconUrl = getValidIconUrl(app);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching icon for', app.name, error);
        iconUrl = getValidIconUrl(app);
      }
    }
    
    // Verify the icon is valid before setting it
    const isValid = await isValidImage(iconUrl);
    
    appsWithIcons.push({
      ...app,
      icon: isValid ? iconUrl : DEFAULT_ICON
    });
  }
  
  return appsWithIcons;
};
