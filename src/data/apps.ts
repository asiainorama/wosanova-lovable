
import { AppData } from './types';

// Default Apps
export const initialApps: AppData[] = [
  {
    id: "wosanova",
    name: "WosaNova",
    icon: "/wosanova.png",
    url: "https://wosanova.com",
    category: "Utilidades",
    description: "Portal de aplicaciones web progresivas",
    isAI: false
  },
  {
    id: "bard",
    name: "Bard",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/64/Google_Bard_logo.svg",
    url: "https://bard.google.com",
    category: "IA",
    description: "Modelo de lenguaje grande de Google AI",
    isAI: true
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    url: "https://chat.openai.com",
    category: "IA",
    description: "Prototipo de chatbot de OpenAI",
    isAI: true
  },
  {
    id: "midjourney",
    name: "Midjourney",
    icon: "https://docs.midjourney.com/static/fa74c9879c981219946c1e60ca979846/favicon.ico",
    url: "https://www.midjourney.com",
    category: "IA",
    description: "Programa de IA que crea imágenes a partir de descripciones textuales",
    isAI: true
  },
  {
    id: "dall-e",
    name: "DALL·E 2",
    icon: "https://openai.com/content/images/2022/04/favicon-32x32.png",
    url: "https://openai.com/dall-e-2/",
    category: "IA",
    description: "Nuevo sistema de IA que puede crear imágenes y arte realistas a partir de una descripción en lenguaje natural",
    isAI: true
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    icon: "https://stability.ai/static/favicon/favicon-32x32.png",
    url: "https://stability.ai/blog/stable-diffusion-public-release",
    category: "IA",
    description: "Modelo de aprendizaje profundo de texto a imagen",
    isAI: true
  },
  {
    id: "perplexity-ai",
    name: "Perplexity AI",
    icon: "https://www.perplexity.ai/favicon.ico",
    url: "https://www.perplexity.ai/",
    category: "IA",
    description: "Motor de búsqueda de respuestas con IA",
    isAI: true
  },
  {
    id: "you-com",
    name: "You.com",
    icon: "https://you.com/favicon.ico",
    url: "https://you.com",
    category: "IA",
    description: "Motor de búsqueda privado con IA",
    isAI: true
  },
  {
    id: "bing-ai",
    name: "Bing AI",
    icon: "https://www.microsoft.com/favicon.ico",
    url: "https://www.bing.com/new",
    category: "IA",
    description: "Chat de Bing con tecnología de IA",
    isAI: true
  },
  {
    id: "claude",
    name: "Claude",
    icon: "https://www.anthropic.com/favicon.ico",
    url: "https://www.anthropic.com/claude",
    category: "IA",
    description: "Asistente de IA para el trabajo",
    isAI: true
  },
  {
    id: "opus",
    name: "Opus",
    icon: "https://cdn.krea.ai/assets/img/opus_logo.svg",
    url: "https://www.krea.ai/opus",
    category: "IA",
    description: "Herramienta de mejora de la calidad de la imagen con IA",
    isAI: true
  },
  {
    id: "stockimg-ai",
    name: "StockImg AI",
    icon: "https://stockimg.ai/favicon.ico",
    url: "https://stockimg.ai/",
    category: "IA",
    description: "Herramientas de diseño con IA",
    isAI: true
  },
  {
    id: "copy-ai",
    name: "Copy AI",
    icon: "https://www.copy.ai/favicon.ico",
    url: "https://www.copy.ai/",
    category: "IA",
    description: "Generador de textos publicitarios con IA",
    isAI: true
  },
  {
    id: "tome-app",
    name: "Tome App",
    icon: "https://tome.app/favicon.ico",
    url: "https://tome.app/",
    category: "IA",
    description: "Narración impulsada por IA",
    isAI: true
  },
  {
    id: "murf-ai",
    name: "Murf AI",
    icon: "https://murf.ai/favicon.ico",
    url: "https://murf.ai/",
    category: "IA",
    description: "Generador de voz con IA",
    isAI: true
  },
  {
    id: "fliki-ai",
    name: "Fliki AI",
    icon: "https://fliki.ai/favicon.ico",
    url: "https://fliki.ai/",
    category: "IA",
    description: "Convertir texto en vídeo con IA",
    isAI: true
  },
  {
    id: "synthesia-io",
    name: "Synthesia IO",
    icon: "https://www.synthesia.io/favicon.ico",
    url: "https://www.synthesia.io/",
    category: "IA",
    description: "Plataforma de vídeo con IA",
    isAI: true
  },
  {
    id: "descript",
    name: "Descript",
    icon: "https://www.descript.com/favicon.ico",
    url: "https://www.descript.com/",
    category: "IA",
    description: "Editor de vídeo y podcast con IA",
    isAI: true
  },
  {
    id: "runwayml",
    name: "RunwayML",
    icon: "https://runwayml.com/favicon.ico",
    url: "https://runwayml.com/",
    category: "IA",
    description: "Herramientas creativas de vídeo con IA",
    isAI: true
  },
  {
    id: "pictory-ai",
    name: "Pictory AI",
    icon: "https://pictory.ai/favicon.ico",
    url: "https://pictory.ai/",
    category: "IA",
    description: "Generador de vídeo con IA",
    isAI: true
  }
];

// Import all app collections
import { additionalApps } from './moreApps';
import { entertainmentApps, productivityApps, socialMediaApps, otherPopularApps, investmentApps } from './additionalApps';
import { newApps } from './newApps';

// Update YouDJ URL in the collections
const updateYouDJUrl = (apps: AppData[]): AppData[] => {
  return apps.map(app => {
    if (app.id === "youdj") {
      return {
        ...app,
        url: "https://youdj.online/?web"
      };
    }
    return app;
  });
};

// Default categories
export const categories = [
  "Productividad", "Organización", "Entretenimiento", "Juegos", "Multimedia",
  "Educación", "Social", "Utilidades", "Herramientas", "Desarrollo",
  "Trabajo", "Estilo de vida", "Salud", "Fitness", "Viajes", "Finanzas",
  "Negocios", "Compras", "Otros", "Arte", "Fotografía", "Música", "IA",
  "Redes Sociales", "Comunicación", "Libros", "Almacenamiento", "Diseño",
  "Noticias", "Criptomonedas", "Comida", "Inmobiliaria", "Inversión"
];

// Remove duplicate entries by comparing app IDs
// Modified to properly handle duplicates - we'll prioritize entries from initialApps, then additionalApps, etc.
export const allApps = (() => {
  const uniqueApps: Record<string, AppData> = {};
  
  // Add apps in order of priority (first source encountered takes precedence)
  const addAppsWithPriority = (apps: AppData[]) => {
    apps.forEach(app => {
      if (!uniqueApps[app.id]) {
        uniqueApps[app.id] = app;
      }
    });
  };
  
  // Add apps in priority order
  addAppsWithPriority(initialApps);
  addAppsWithPriority(updateYouDJUrl(additionalApps));
  addAppsWithPriority(updateYouDJUrl(entertainmentApps));
  addAppsWithPriority(updateYouDJUrl(productivityApps));
  addAppsWithPriority(updateYouDJUrl(socialMediaApps));
  addAppsWithPriority(updateYouDJUrl(otherPopularApps));
  addAppsWithPriority(updateYouDJUrl(investmentApps));
  addAppsWithPriority(updateYouDJUrl(newApps));
  
  // Convert the object back to an array
  return Object.values(uniqueApps);
})();

// Export AI specific apps
export const aiApps = allApps.filter(app => app.isAI);

// Re-export the AppData type for convenience
export type { AppData };
