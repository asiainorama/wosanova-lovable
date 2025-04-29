
import { AppData } from '@/data/apps';

const DEFAULT_ICON = "/placeholder.svg";
const BRANDFETCH_API_KEY = "aJ5lYIRJ+USZ1gYZaEjt9iNosNoWh4XtrLxTR1vsPHc=";

/**
 * Fallback icons for known applications if Brandfetch doesn't work
 */
const FALLBACK_ICONS: Record<string, string> = {
  "chatgpt": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  "claude": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Claude_Anthropic_Symbol.svg", 
  "gemini": "https://seeklogo.com/images/G/google-gemini-logo-12C7941017-seeklogo.com.png",
  "midjourney": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
  "dalle": "https://upload.wikimedia.org/wikipedia/commons/5/55/DALL-E_Logo.png",
  "stable-diffusion": "https://upload.wikimedia.org/wikipedia/commons/8/86/Stable_Diffusion_logo.png",
  "copilot": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Copilot_logo.svg",
  "github": "https://github.githubassets.com/favicons/favicon.svg",
  "google": "https://www.google.com/favicon.ico",
  "youtube": "https://www.youtube.com/s/desktop/7c155e84/img/favicon_144x144.png",
  "facebook": "https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico",
  "instagram": "https://static.cdninstagram.com/rsrc.php/v3/yR/r/f4auM5FMmWv.png",
  "twitter": "https://abs.twimg.com/responsive-web/client-web/icon-svg.168b89da.svg",
  "x": "https://abs.twimg.com/responsive-web/client-web/icon-svg.168b89da.svg",
  "netflix": "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico",
  "spotify": "https://www.scdn.co/i/_global/favicon.png",
  "amazon": "https://www.amazon.com/favicon.ico",
  "microsoft": "https://c.s-microsoft.com/favicon.ico",
  "apple": "https://www.apple.com/favicon.ico",
  "dropbox": "https://www.dropbox.com/static/30168/images/favicon.ico",
  "slack": "https://a.slack-edge.com/cebaa/img/ico/favicon.ico",
  "discord": "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico"
};

/**
 * Fetches icon from Brandfetch API
 * @param domain Domain to fetch icon for
 * @returns Promise with icon URL or null if not found
 */
const fetchBrandfetchIcon = async (domain: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BRANDFETCH_API_KEY}`,
      },
    });

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
 * Tries to get a valid icon URL for an app
 * @param app App data
 * @returns URL of the icon or default image
 */
export const getValidIconUrl = (app: AppData): string => {
  // If the app already has a valid icon (not from Brandfetch), use it
  if (app.icon && !app.icon.includes('brandfetch.com') && !app.icon.includes('placeholder')) {
    return app.icon;
  }
  
  // If we have a fallback for this app, use it
  if (app.id && FALLBACK_ICONS[app.id]) {
    return FALLBACK_ICONS[app.id];
  }
  
  // For specific categories, try different approaches
  if (app.category === 'Redes Sociales' || 
      app.category === 'Entretenimiento' || 
      app.category === 'Productividad') {
    return `https://logo.clearbit.com/${app.url.replace('https://', '').replace('www.', '').split('/')[0]}`;
  }
  
  // For the rest, try with favicon.ico directly
  const domain = app.url.replace('https://', '').replace('www.', '').split('/')[0];
  return `https://${domain}/favicon.ico`;
};

/**
 * Verifies if an image URL is valid
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
 * Fixes icons for a list of apps
 * @param apps List of apps
 * @returns List of apps with fixed icons
 */
export const fixAppIcons = async (apps: AppData[]): Promise<AppData[]> => {
  const appsWithIcons = [];
  
  for (const app of apps) {
    let iconUrl = app.icon;
    
    // If no icon, or current icon is placeholder, try to get one from Brandfetch
    if (!iconUrl || iconUrl.includes('placeholder') || iconUrl.includes('brandfetch.com')) {
      try {
        const domain = app.url.replace('https://', '').replace('www.', '').split('/')[0];
        const brandfetchIcon = await fetchBrandfetchIcon(domain);
        
        if (brandfetchIcon) {
          iconUrl = brandfetchIcon;
        } else {
          // If Brandfetch doesn't work, try other methods
          iconUrl = getValidIconUrl(app);
        }
      } catch (error) {
        console.error('Error fetching icon:', error);
        iconUrl = getValidIconUrl(app);
      }
    }
    
    appsWithIcons.push({
      ...app,
      icon: iconUrl
    });
  }
  
  return appsWithIcons;
};
