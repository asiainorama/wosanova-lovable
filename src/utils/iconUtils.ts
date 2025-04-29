
import { AppData } from '@/data/apps';

const DEFAULT_ICON = "/placeholder.svg";

/**
 * Fallback icons para aplicaciones conocidas si Brandfetch no funciona
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
 * Intenta obtener un icono válido para una aplicación
 * @param app Datos de la aplicación
 * @returns URL del icono o imagen por defecto
 */
export const getValidIconUrl = (app: AppData): string => {
  // Si la app ya tiene un icono que funciona, lo usamos
  if (app.icon && !app.icon.includes('brandfetch.com')) {
    return app.icon;
  }
  
  // Si tenemos un fallback para esta app, lo usamos
  if (app.id && FALLBACK_ICONS[app.id]) {
    return FALLBACK_ICONS[app.id];
  }
  
  // Para categorías específicas, intentamos diferentes enfoques
  if (app.category === 'Redes Sociales' || 
      app.category === 'Entretenimiento' || 
      app.category === 'Productividad') {
    return `https://logo.clearbit.com/${app.url.replace('https://', '').replace('www.', '').split('/')[0]}`;
  }
  
  // Para el resto, intentamos con favicon.ico directo
  const domain = app.url.replace('https://', '').replace('www.', '').split('/')[0];
  return `https://${domain}/favicon.ico`;
};

/**
 * Verifica si una URL de imagen es válida
 * @param url URL a verificar
 * @returns Promise con un booleano indicando si la imagen es válida
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
 * Corrige los iconos de una lista de aplicaciones
 * @param apps Lista de aplicaciones
 * @returns Lista de aplicaciones con iconos corregidos
 */
export const fixAppIcons = async (apps: AppData[]): Promise<AppData[]> => {
  return apps.map(app => {
    const iconUrl = getValidIconUrl(app);
    return {
      ...app,
      icon: iconUrl
    };
  });
};
