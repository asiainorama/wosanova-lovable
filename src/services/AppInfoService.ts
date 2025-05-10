
import { AppData } from '@/data/types';
import { toast } from 'sonner';

/**
 * Generates a URL-friendly ID from a name
 * @param name The name to convert to ID
 * @returns URL-friendly ID string
 */
export const generateIdFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * Extract domain from URL
 * @param url URL to extract domain from
 * @returns Domain name
 */
export const extractDomain = (url: string): string => {
  try {
    // Fix the comma operator issue by using proper conditional logic
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url.split('/')[0].toLowerCase();
    }
    
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace('www.', '').toLowerCase();
  } catch (error) {
    // If URL parsing fails, just return the original input cleaned up
    return url.replace(/https?:\/\/(www\.)?/i, '').split('/')[0].toLowerCase();
  }
};

/**
 * Get logo from Clearbit API
 * @param domain Domain to get logo for
 * @returns Logo URL or null
 */
const getLogoClearbit = async (domain: string): Promise<string | null> => {
  const url = `https://logo.clearbit.com/${domain}`;
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    // Since we can't check status with no-cors, we'll just return the URL
    // It will be validated later when displayed
    return url;
  } catch (error) {
    return null;
  }
};

/**
 * Get logo from DuckDuckGo API
 * @param domain Domain to get logo for
 * @returns Logo URL or null
 */
const getLogoDuckDuckGo = async (domain: string): Promise<string | null> => {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
};

/**
 * Get logo using Google favicon service
 * @param domain Domain to get logo for
 * @returns Logo URL or null
 */
const getLogoGoogle = async (domain: string): Promise<string | null> => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

/**
 * Try to autofill app details from a URL
 * @param url Website URL to extract info from
 * @returns Partial app data
 */
export const autofillFromUrl = async (url: string): Promise<Partial<AppData>> => {
  if (!url || url.length < 5) return {};
  
  try {
    // Normalize URL
    let normalizedUrl = url;
    if (!url.startsWith('http')) {
      normalizedUrl = `https://${url}`;
    }
    
    const domain = extractDomain(normalizedUrl);
    if (!domain) return {};
    
    // Start fetching logo in parallel with different sources
    const logoPromises = [
      getLogoClearbit(domain),
      getLogoDuckDuckGo(domain),
      getLogoGoogle(domain)
    ];
    
    // Wait for the first successful logo
    const logos = await Promise.all(logoPromises);
    const logo = logos.find(l => l !== null) || null;
    
    // Try to guess a name from the domain
    const name = domain
      .split('.')
      .filter(part => part.length > 2 && !['com', 'org', 'net', 'io', 'app', 'co'].includes(part))
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Determine category based on domain keywords
    let category = "Utilidades";
    
    if (domain.includes('chat') || domain.includes('openai') || domain.includes('ai') || 
        domain.includes('gpt') || domain.includes('claude') || domain.includes('gemini')) {
      category = "IA";
    } else if (domain.includes('instagram') || domain.includes('facebook') || 
              domain.includes('twitter') || domain.includes('linkedin')) {
      category = "Redes Sociales";
    } else if (domain.includes('notion') || domain.includes('trello') || 
              domain.includes('asana') || domain.includes('office')) {
      category = "Productividad";
    } else if (domain.includes('netflix') || domain.includes('spotify') || 
              domain.includes('youtube') || domain.includes('disney')) {
      category = "Entretenimiento";
    } else if (domain.includes('google') || domain.includes('bing') || domain.includes('yahoo')) {
      category = "Búsqueda";
    }
    
    return {
      name: name || '',
      icon: logo || '',
      url: normalizedUrl,
      category
    };
  } catch (error) {
    console.error('Error autofilling from URL:', error);
    return {};
  }
};

/**
 * Try to get app icon based on name
 * @param name App name to search for
 * @returns Icon URL if found
 */
export const autofillFromName = async (name: string): Promise<Partial<AppData>> => {
  if (!name || name.length < 2) return {};
  
  try {
    // Use a hardcoded map for common apps
    const knownApps: Record<string, { icon: string, url: string, category: string }> = {
      'gmail': { 
        icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
        url: 'https://mail.google.com',
        category: 'Comunicación'
      },
      'google': { 
        icon: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
        url: 'https://www.google.com',
        category: 'Búsqueda'
      },
      'youtube': { 
        icon: 'https://www.youtube.com/s/desktop/e4d15d2c/img/favicon_144x144.png',
        url: 'https://www.youtube.com',
        category: 'Entretenimiento'
      },
      'netflix': { 
        icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico',
        url: 'https://www.netflix.com',
        category: 'Entretenimiento'
      },
      'spotify': { 
        icon: 'https://open.spotifycdn.com/cdn/images/favicon.5cb2bd30.ico',
        url: 'https://www.spotify.com',
        category: 'Entretenimiento'
      },
      'twitter': { 
        icon: 'https://abs.twimg.com/responsive-web/client-web/icon-svg.168b89da.svg',
        url: 'https://twitter.com',
        category: 'Redes Sociales'
      },
      'x': { 
        icon: 'https://abs.twimg.com/responsive-web/client-web/icon-svg.168b89da.svg',
        url: 'https://x.com',
        category: 'Redes Sociales'
      },
      'facebook': { 
        icon: 'https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico',
        url: 'https://www.facebook.com',
        category: 'Redes Sociales'
      },
      'instagram': { 
        icon: 'https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-XVG-w1.png',
        url: 'https://www.instagram.com',
        category: 'Redes Sociales'
      },
      'slack': { 
        icon: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png',
        url: 'https://slack.com',
        category: 'Comunicación'
      },
      'discord': { 
        icon: 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico',
        url: 'https://discord.com',
        category: 'Comunicación'
      },
      'github': { 
        icon: 'https://github.githubassets.com/favicons/favicon.svg',
        url: 'https://github.com',
        category: 'Desarrollo'
      },
      'chatgpt': { 
        icon: 'https://chat.openai.com/apple-touch-icon.png',
        url: 'https://chat.openai.com',
        category: 'IA'
      },
      'claude': { 
        icon: 'https://claude.ai/favicon.ico',
        url: 'https://claude.ai',
        category: 'IA'
      },
      'gemini': { 
        icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg',
        url: 'https://gemini.google.com',
        category: 'IA'
      },
      'notion': { 
        icon: 'https://www.notion.so/images/favicon.ico',
        url: 'https://www.notion.so',
        category: 'Productividad'
      },
      'trello': { 
        icon: 'https://trello.com/favicon.ico',
        url: 'https://trello.com',
        category: 'Productividad'
      }
    };
    
    // Check for matching app names (case insensitive)
    const normalizedName = name.toLowerCase();
    for (const [appName, appInfo] of Object.entries(knownApps)) {
      if (normalizedName.includes(appName) || appName.includes(normalizedName)) {
        return {
          icon: appInfo.icon,
          url: appInfo.url,
          category: appInfo.category
        };
      }
    }
    
    // If no direct match, use Google favicon as fallback based on name search
    return {
      icon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(name)}&sz=128`
    };
  } catch (error) {
    console.error('Error autofilling from name:', error);
    return {};
  }
};
