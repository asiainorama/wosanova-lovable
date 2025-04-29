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
  "Búsqueda",
  "Herramientas",
  "SEO",
  "Redes Sociales",
  "Educación",
  "Entretenimiento",
  "Inversión",
  "Criptomonedas",
  "Compras",
  "Viajes",
  "Servicios"
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
  },
  // Nuevas aplicaciones
  {
    id: "10web",
    name: "10web",
    icon: "https://10web.io/wp-content/uploads/2022/03/cropped-10web-favicon-32x32.png",
    url: "https://10web.io/",
    category: "Desarrollo",
    description: "Plataforma de automatización de WordPress con IA",
    isAI: true
  },
  {
    id: "adcopy",
    name: "AdCopy",
    icon: "https://adcopy.ai/favicon.ico",
    url: "https://adcopy.ai/",
    category: "Marketing",
    description: "Crea textos publicitarios optimizados con IA",
    isAI: true
  },
  {
    id: "adcreative",
    name: "AdCreative",
    icon: "https://adcreative.ai/favicon.ico",
    url: "https://adcreative.ai/",
    category: "Marketing",
    description: "Genera creatividades y anuncios impactantes con IA",
    isAI: true
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    icon: "https://static.ahrefs.com/favicon-32x32.png",
    url: "https://ahrefs.com/",
    category: "SEO",
    description: "Herramienta de análisis SEO con funciones de IA",
    isAI: true
  },
  {
    id: "alli-ai",
    name: "Alli AI",
    icon: "https://alli.io/favicon.ico",
    url: "https://alli.io/",
    category: "Productividad",
    description: "Asistente de IA para ayudar en tareas diarias",
    isAI: true
  },
  {
    id: "ballonary",
    name: "Ballonary",
    icon: "https://www.ballonary.com/favicon.ico",
    url: "https://www.ballonary.com/",
    category: "Diseño",
    description: "Creador de ilustraciones con globos y figuras mediante IA",
    isAI: true
  },
  {
    id: "beforesunset-ai",
    name: "BeforeSunset AI",
    icon: "https://beforesunset.ai/favicon.ico",
    url: "https://beforesunset.ai/",
    category: "Productividad",
    description: "Planificador inteligente que optimiza tu día con IA",
    isAI: true
  },
  {
    id: "bing",
    name: "Bing",
    icon: "https://www.bing.com/sa/simg/favicon-2x.ico",
    url: "https://www.bing.com/",
    category: "Búsqueda",
    description: "Motor de búsqueda de Microsoft con integración de IA",
    isAI: true
  },
  {
    id: "blackbox-ai",
    name: "Blackbox AI",
    icon: "https://www.useblackbox.io/favicon.ico",
    url: "https://www.useblackbox.io/",
    category: "Desarrollo",
    description: "Asistente de código con IA para programadores",
    isAI: true
  },
  {
    id: "blogseo",
    name: "Blogseo",
    icon: "https://blogseo.ai/favicon.ico",
    url: "https://blogseo.ai/",
    category: "SEO",
    description: "Optimización de blogs y contenidos para SEO con IA",
    isAI: true
  },
  {
    id: "bolt",
    name: "Bolt",
    icon: "https://bolt.ai/favicon.ico",
    url: "https://bolt.ai/",
    category: "Productividad",
    description: "Automatización de procesos de negocio con IA",
    isAI: true
  },
  {
    id: "brandmark",
    name: "Brandmark",
    icon: "https://brandmark.io/favicon.ico",
    url: "https://brandmark.io/",
    category: "Diseño",
    description: "Diseño de logos profesionales con IA",
    isAI: true
  },
  {
    id: "bright-eye",
    name: "Bright Eye",
    icon: "https://bright-eye.ai/favicon.ico",
    url: "https://bright-eye.ai/",
    category: "Imagen",
    description: "Mejora y corrección automática de imágenes con IA",
    isAI: true
  },
  {
    id: "canva",
    name: "Canva",
    icon: "https://static.canva.com/static/images/favicon-1.ico",
    url: "https://www.canva.com/",
    category: "Diseño",
    description: "Plataforma de diseño gráfico con funciones de IA integradas",
    isAI: true
  },
  {
    id: "chatbase",
    name: "Chatbase",
    icon: "https://www.chatbase.co/favicon.ico",
    url: "https://www.chatbase.co/",
    category: "Asistentes",
    description: "Crea chatbots personalizados basados en tus datos",
    isAI: true
  },
  {
    id: "chatbot",
    name: "Chatbot",
    icon: "https://www.chatbot.com/favicon.ico",
    url: "https://www.chatbot.com/",
    category: "Asistentes",
    description: "Plataforma para crear chatbots inteligentes",
    isAI: true
  },
  {
    id: "chatfuel",
    name: "Chatfuel",
    icon: "https://chatfuel.com/favicon.ico",
    url: "https://chatfuel.com/",
    category: "Asistentes",
    description: "Constructor de chatbots para redes sociales",
    isAI: true
  },
  {
    id: "chatgpt-4o-image-generation",
    name: "ChatGPT-4o Image Generation",
    icon: "https://chat.openai.com/apple-touch-icon.png",
    url: "https://chat.openai.com/",
    category: "Imagen",
    description: "Generación de imágenes avanzada con el modelo GPT-4o",
    isAI: true
  },
  {
    id: "chatsimple",
    name: "ChatSimple",
    icon: "https://www.chatsimple.ai/favicon.ico",
    url: "https://www.chatsimple.ai/",
    category: "Asistentes",
    description: "Chatbots simples y efectivos para sitios web",
    isAI: true
  },
  {
    id: "clay",
    name: "Clay",
    icon: "https://clay.com/favicon.ico",
    url: "https://clay.com/",
    category: "Ventas",
    description: "Plataforma de enriquecimiento de contactos con IA",
    isAI: true
  },
  {
    id: "clearscope",
    name: "Clearscope",
    icon: "https://www.clearscope.io/favicon.png",
    url: "https://www.clearscope.io/",
    category: "SEO",
    description: "Optimización de contenido para SEO con IA",
    isAI: true
  },
  {
    id: "clickup-app",
    name: "ClickUp",
    icon: "https://clickup.com/landing/images/favicon.png",
    url: "https://clickup.com",
    category: "Productividad",
    description: "Gestión de proyectos y tareas con funciones de IA",
    isAI: true
  },
  {
    id: "github-copilot-app",
    name: "Copilot",
    icon: "https://github.githubassets.com/favicons/favicon.png",
    url: "https://github.com/features/copilot",
    category: "Desarrollo",
    description: "Asistente de programación basado en IA",
    isAI: true
  },
  {
    id: "copyai-app",
    name: "CopyAI",
    icon: "https://assets-global.website-files.com/628288c5cd3e8411b90a36a4/629a702d187117d31fb5489f_copy-favicon-3.png",
    url: "https://www.copy.ai",
    category: "Escritura",
    description: "Genera textos y copys creativos con IA",
    isAI: true
  },
  {
    id: "coze",
    name: "COZE",
    icon: "https://coze.com/favicon.ico",
    url: "https://coze.com/",
    category: "Desarrollo",
    description: "Plataforma para construir bots de IA sin código",
    isAI: true
  },
  {
    id: "cursor",
    name: "Cursor",
    icon: "https://cursor.sh/favicon.ico",
    url: "https://cursor.sh/",
    category: "Desarrollo",
    description: "Editor de código potenciado con IA",
    isAI: true
  },
  {
    id: "deepai",
    name: "DeepAI",
    icon: "https://deepai.org/favicon.ico",
    url: "https://deepai.org/",
    category: "Herramientas",
    description: "Suite de herramientas de IA para diferentes tareas",
    isAI: true
  },
  {
    id: "descript-app",
    name: "Descript",
    icon: "https://www.descript.com/favicon.ico",
    url: "https://www.descript.com/",
    category: "Audio",
    description: "Editor de audio y vídeo con funciones de transcripción de IA",
    isAI: true
  },
  {
    id: "designs",
    name: "Designs",
    icon: "https://designs.ai/favicon.ico",
    url: "https://designs.ai/",
    category: "Diseño",
    description: "Plataforma de diseño gráfico automatizado con IA",
    isAI: true
  },
  {
    id: "dialogflow",
    name: "Dialogflow",
    icon: "https://www.gstatic.com/devrel-devsite/prod/v2210075187f059a839246c2c03840474501c3c6024a99fb78f6293c1b5eb239d/cloud/images/favicons/onecloud/favicon.ico",
    url: "https://cloud.google.com/dialogflow",
    category: "Desarrollo",
    description: "Plataforma de Google para crear interfaces conversacionales",
    isAI: true
  },
  {
    id: "diamond",
    name: "Diamond",
    icon: "https://www.diamond.ai/favicon.ico",
    url: "https://www.diamond.ai/",
    category: "Productividad",
    description: "Asistente virtual basado en IA para equipos",
    isAI: true
  },
  {
    id: "dribbble",
    name: "Dribbble",
    icon: "https://cdn.dribbble.com/assets/favicon-b38525134603b9513174ec887944bde1a869eb6cd414f4d640ee48ab2a15a26b.ico",
    url: "https://dribbble.com/",
    category: "Diseño",
    description: "Comunidad de diseñadores con herramientas de IA",
    isAI: true
  },
  {
    id: "drippi-ai",
    name: "Drippi AI",
    icon: "https://www.drippi.ai/favicon.ico",
    url: "https://www.drippi.ai/",
    category: "Marketing",
    description: "Automatización de campañas de email marketing con IA",
    isAI: true
  },
  {
    id: "durable",
    name: "Durable",
    icon: "https://durable.co/favicon.ico",
    url: "https://durable.co/",
    category: "Desarrollo",
    description: "Constructor de sitios web con IA en minutos",
    isAI: true
  },
  {
    id: "fliki",
    name: "Fliki",
    icon: "https://fliki.ai/favicon.ico",
    url: "https://fliki.ai/",
    category: "Video",
    description: "Convierte texto en videos con voces de IA",
    isAI: true
  },
  {
    id: "folk",
    name: "Folk",
    icon: "https://www.folk.app/favicon.ico",
    url: "https://www.folk.app/",
    category: "Ventas",
    description: "CRM inteligente con asistente de IA",
    isAI: true
  },
  {
    id: "framer",
    name: "Framer",
    icon: "https://framer.com/favicon.ico",
    url: "https://www.framer.com/",
    category: "Desarrollo",
    description: "Herramienta de diseño web y prototipado con IA",
    isAI: true
  },
  {
    id: "gitfluence",
    name: "GitFluence",
    icon: "https://gitfluence.com/favicon.ico",
    url: "https://gitfluence.com/",
    category: "Desarrollo",
    description: "Análisis y optimización de repositorios Git con IA",
    isAI: true
  },
  {
    id: "gleap",
    name: "Gleap",
    icon: "https://gleap.io/favicon.ico",
    url: "https://gleap.io/",
    category: "Desarrollo",
    description: "Plataforma de feedback y reporte de bugs con IA",
    isAI: true
  },
  {
    id: "gong",
    name: "Gong",
    icon: "https://www.gong.io/wp-content/themes/gong/favicon/favicon-32x32.png",
    url: "https://www.gong.io/",
    category: "Ventas",
    description: "Plataforma de inteligencia de ventas con análisis de IA",
    isAI: true
  },
  {
    id: "google-gemini-app",
    name: "Google Gemini",
    icon: "https://gemini.google.com/favicon.ico",
    url: "https://gemini.google.com/",
    category: "Asistentes",
    description: "Asistente de IA multimodal de Google",
    isAI: true
  },
  {
    id: "grammarly",
    name: "Grammarly",
    icon: "https://static.grammarly.com/assets/files/favicon-32x32.png",
    url: "https://www.grammarly.com/",
    category: "Escritura",
    description: "Asistente de escritura y corrección gramatical con IA",
    isAI: true
  },
  {
    id: "grok-3",
    name: "Grok 3",
    icon: "https://grok.x.ai/favicon.ico",
    url: "https://grok.x.ai/",
    category: "Asistentes",
    description: "Asistente de IA conversacional de xAI",
    isAI: true
  },
  {
    id: "heygen-app",
    name: "HeyGen",
    icon: "https://assets-global.website-files.com/63fdcbe48aa020c0a5493507/649e4c3d01fe7455f38f4527_favicon-32x32.png",
    url: "https://www.heygen.com/",
    category: "Video",
    description: "Generador de videos con presentadores virtuales realistas",
    isAI: true
  },
  {
    id: "hix",
    name: "Hix",
    icon: "https://hix.ai/favicon.ico",
    url: "https://hix.ai/",
    category: "Asistentes",
    description: "Asistente de productividad con IA personalizable",
    isAI: true
  }
];
