export interface AppData {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
  description: string;
  isAI: boolean;
}

export const categories = [
  "Todas",
  "Asistentes",
  "Imagen",
  "Video",
  "Audio",
  "Escritura",
  "Productividad",
  "Desarrollo",
  "Diseño",
  "Marketing",
  "Presentaciones",
  "Ventas",
  "Búsqueda"
];

export const aiApps: AppData[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    url: "https://chat.openai.com",
    category: "Asistentes",
    description: "Asistente de IA conversacional desarrollado por OpenAI",
    isAI: true
  },
  {
    id: "Claude",
    name: "Claude",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Claude_Anthropic_Symbol.svg",
    url: "https://claude.ai",
    category: "Asistentes",
    description: "Asistente de IA conversacional desarrollado por Anthropic",
    isAI: true
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "https://seeklogo.com/images/G/google-gemini-logo-12C7941017-seeklogo.com.png",
    url: "https://gemini.google.com",
    category: "Asistentes",
    description: "Asistente de IA conversacional desarrollado por Google",
    isAI: true
  },
  {
    id: "midjourney",
    name: "Midjourney",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
    url: "https://www.midjourney.com",
    category: "Imagen",
    description: "Generador de imágenes mediante IA",
    isAI: true
  },
  {
    id: "dalle",
    name: "DALL-E",
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/55/DALL-E_Logo.png",
    url: "https://openai.com/dall-e-3",
    category: "Imagen",
    description: "Generador de imágenes creado por OpenAI",
    isAI: true
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/86/Stable_Diffusion_logo.png",
    url: "https://stability.ai",
    category: "Imagen",
    description: "Modelo de difusión latente de código abierto",
    isAI: true
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Copilot_logo.svg",
    url: "https://github.com/features/copilot",
    category: "Desarrollo",
    description: "Asistente de programación de Microsoft y GitHub",
    isAI: true
  },
  {
    id: "11-labs",
    name: "11 Labs",
    icon: "https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/nwphx8l5hiv7xxktkzr5",
    url: "https://elevenlabs.io",
    category: "Audio",
    description: "Generación de voces realistas con IA para narraciones y audios",
    isAI: true
  },
  {
    id: "simplified",
    name: "Simplified",
    icon: "https://simplified.com/favicon.png",
    url: "https://simplified.com",
    category: "Diseño",
    description: "Plataforma todo en uno para diseño y edición de vídeos con IA",
    isAI: true
  },
  {
    id: "veed",
    name: "VEED",
    icon: "https://www.veed.io/favicon.ico",
    url: "https://www.veed.io",
    category: "Video",
    description: "Editor de vídeo online con IA para subtítulos automáticos y efectos",
    isAI: true
  },
  {
    id: "heygen",
    name: "HeyGen",
    icon: "https://assets-global.website-files.com/63fdcbe48aa020c0a5493507/649e4c3d01fe7455f38f4527_favicon-32x32.png",
    url: "https://www.heygen.com",
    category: "Video",
    description: "Avatares digitales que hablan con voz y gestos realistas (IA)",
    isAI: true
  },
  {
    id: "ideogram",
    name: "Ideogram",
    icon: "https://ideogram.ai/favicon.ico",
    url: "https://ideogram.ai",
    category: "Diseño",
    description: "IA especializada en imágenes con texto integrado",
    isAI: true
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
    url: "https://www.notion.so/product/ai",
    category: "Productividad",
    description: "Integración de IA en Notion para resúmenes y generación de ideas",
    isAI: true
  },
  {
    id: "vapi",
    name: "Vapi",
    icon: "https://vapi.ai/favicon.ico",
    url: "https://vapi.ai",
    category: "Audio",
    description: "IA para llamadas automatizadas (atención al cliente, ventas)",
    isAI: true
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    icon: "https://www.gstatic.com/lamda/images/favicon_v1_150160c4f2397e16.svg",
    url: "https://notebooklm.google.com",
    category: "Escritura",
    description: "Análisis de documentos mediante chat (Google)",
    isAI: true
  },
  {
    id: "semrush",
    name: "Semrush",
    icon: "https://www.semrush.com/static/images/favicon/favicon-32x32.png",
    url: "https://www.semrush.com",
    category: "Marketing",
    description: "Suite de marketing digital con IA para SEO y análisis",
    isAI: true
  },
  {
    id: "decktopus",
    name: "Decktopus AI",
    icon: "https://decktopus.com/favicon/android-chrome-192x192.png",
    url: "https://www.decktopus.com",
    category: "Presentaciones",
    description: "Crea presentaciones profesionales en segundos con diseño elegante",
    isAI: true
  },
  {
    id: "gamma",
    name: "Gamma",
    icon: "https://gamma.app/favicon.ico",
    url: "https://gamma.app",
    category: "Presentaciones",
    description: "Genera presentaciones, documentos y páginas web en segundos",
    isAI: true
  },
  {
    id: "beehiiv",
    name: "Beehiiv",
    icon: "https://cdn.beehiiv.com/images/brand/favicon-32x32.png",
    url: "https://beehiiv.com",
    category: "Marketing",
    description: "Plataforma de newsletters con herramientas de crecimiento impulsadas por IA",
    isAI: true
  },
  {
    id: "tweet-hunter",
    name: "Tweet Hunter",
    icon: "https://tweethunter.io/favicon-32x32.png",
    url: "https://tweethunter.io",
    category: "Marketing",
    description: "Optimización y programación de tweets con IA",
    isAI: true
  },
  {
    id: "copy-ai",
    name: "Copy AI",
    icon: "https://assets-global.website-files.com/628288c5cd3e8411b90a36a4/629a702d187117d31fb5489f_copy-favicon-3.png",
    url: "https://www.copy.ai",
    category: "Marketing",
    description: "Herramienta de copywriting automatizado para campañas",
    isAI: true
  },
  {
    id: "revid",
    name: "Revid",
    icon: "https://revid.ai/favicon.ico",
    url: "https://revid.ai",
    category: "Video",
    description: "Editor de vídeo con plantillas y efectos basados en IA",
    isAI: true
  },
  {
    id: "pictory",
    name: "Pictory",
    icon: "https://pictory.ai/favicon-32x32.png",
    url: "https://pictory.ai",
    category: "Video",
    description: "Convierte texto en vídeos profesionales con IA",
    isAI: true
  },
  {
    id: "monday",
    name: "Monday",
    icon: "https://monday.com/favicon.ico",
    url: "https://monday.com",
    category: "Productividad",
    description: "Gestión de proyectos con automatización y plantillas inteligentes",
    isAI: true
  },
  {
    id: "clickup",
    name: "ClickUp",
    icon: "https://clickup.com/landing/images/favicon.png",
    url: "https://clickup.com",
    category: "Productividad",
    description: "Plataforma de productividad con integración de IA para tareas",
    isAI: true
  },
  {
    id: "microsoft-designer",
    name: "Microsoft Designer",
    icon: "https://designer.microsoft.com/favicon.ico",
    url: "https://designer.microsoft.com",
    category: "Diseño",
    description: "Herramienta de diseño gráfico con IA integrada",
    isAI: true
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    icon: "https://www.adobe.com/content/dam/shared/images/product-icons/svg/firefly.svg",
    url: "https://www.adobe.com/products/firefly.html",
    category: "Diseño",
    description: "Generación de imágenes y diseños con IA por Adobe",
    isAI: true
  },
  {
    id: "superhuman",
    name: "Superhuman",
    icon: "https://superhuman.com/favicon.ico",
    url: "https://superhuman.com",
    category: "Ventas",
    description: "Cliente de email con IA para mejorar la productividad en ventas",
    isAI: true
  },
  {
    id: "hubspot-sales",
    name: "Hubspot Sales Hub",
    icon: "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png",
    url: "https://www.hubspot.com/products/sales",
    category: "Ventas",
    description: "Automatización de ventas y seguimiento con IA",
    isAI: true
  }
];
