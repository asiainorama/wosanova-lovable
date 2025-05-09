
import { AppData } from "@/data/types";
import { isValidImage } from "@/utils/iconUtils";

interface AutofillResult {
  name?: string;
  icon?: string;
  description?: string;
  category?: string;
}

// Common categories mappings
const categoryMappings: Record<string, string> = {
  "social": "Redes Sociales",
  "social media": "Redes Sociales",
  "communication": "Comunicación",
  "productivity": "Productividad",
  "finance": "Finanzas",
  "entertainment": "Entretenimiento",
  "education": "Educación",
  "health": "Salud",
  "medical": "Salud",
  "fitness": "Bienestar",
  "wellness": "Bienestar",
  "food": "Alimentación",
  "travel": "Viajes",
  "transportation": "Transporte",
  "shopping": "Compras",
  "ecommerce": "Compras",
  "news": "Noticias",
  "weather": "Clima",
  "utilities": "Utilidades",
  "tools": "Utilidades",
  "development": "Desarrollo",
  "programming": "Desarrollo",
  "ai": "Inteligencia Artificial",
  "games": "Juegos",
  "art": "Arte y Diseño",
  "design": "Arte y Diseño",
  "music": "Música",
  "video": "Video",
  "photos": "Fotografía",
  "chat": "Comunicación",
  "messaging": "Comunicación"
};

/**
 * Extract domain name from URL
 */
const extractDomain = (url: string): string => {
  try {
    let domain = url.replace(/^https?:\/\//, '');
    domain = domain.split('/')[0];
    return domain.replace('www.', '');
  } catch (e) {
    return '';
  }
};

/**
 * Try to guess category from domain or description
 */
const guessCategory = (domain: string, description: string = ''): string => {
  const text = `${domain} ${description}`.toLowerCase();
  
  for (const [keyword, category] of Object.entries(categoryMappings)) {
    if (text.includes(keyword.toLowerCase())) {
      return category;
    }
  }
  
  return "Utilidades"; // Default category
};

/**
 * Check various icon URL patterns for a domain
 */
const findIconUrl = async (domain: string): Promise<string | null> => {
  const iconPatterns = [
    `https://${domain}/favicon.svg`,
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon-32x32.png`,
    `https://${domain}/apple-touch-icon.png`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://logo.clearbit.com/${domain}?size=128`,
    `https://icon.horse/icon/${domain}?size=large`,
  ];

  for (const iconUrl of iconPatterns) {
    try {
      const isValid = await isValidImage(iconUrl);
      if (isValid) {
        return iconUrl;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
};

/**
 * Generate a simple slug/ID from a name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Auto-fill based on URL
 */
export const autofillFromUrl = async (url: string): Promise<AutofillResult> => {
  try {
    if (!url || !url.includes('.')) {
      return {};
    }

    const domain = extractDomain(url);
    if (!domain) return {};
    
    // Try to get the icon
    const icon = await findIconUrl(domain);
    
    // Generate a name from domain (capitalize first letter of each part)
    const name = domain
      .split('.')
      .slice(0, -1) // Remove TLD
      .join(' ')
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word
    
    return {
      name,
      icon: icon || undefined,
      category: guessCategory(domain)
    };
  } catch (error) {
    console.error('Error autofilling from URL:', error);
    return {};
  }
};

/**
 * Auto-fill based on app name
 */
export const autofillFromName = async (name: string): Promise<AutofillResult> => {
  try {
    if (!name || name.length < 3) {
      return {};
    }
    
    // Generate a domain guess based on name
    const domainGuess = name.toLowerCase().replace(/\s+/g, '') + '.com';
    
    // Try to get the icon
    const icon = await findIconUrl(domainGuess);
    
    return {
      icon: icon || undefined,
      category: guessCategory(name)
    };
  } catch (error) {
    console.error('Error autofilling from name:', error);
    return {};
  }
};

/**
 * Generate ID (slug) from name
 */
export const generateIdFromName = (name: string): string => {
  return generateSlug(name);
};
