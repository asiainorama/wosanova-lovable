import { AppData } from './types';

// All apps consolidated in a single file
export const allApps: AppData[] = [
  // Default Apps (from apps.ts)
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
  },

  // Additional apps from moreApps.ts
  {
    id: "make-ai",
    name: "Make AI",
    icon: "https://make.ai/favicon.ico",
    url: "https://make.ai/",
    category: "IA",
    description: "Plataforma de creación y diseño impulsada por inteligencia artificial",
    isAI: true
  },
  {
    id: "hyperwrite",
    name: "HyperWrite",
    icon: "https://hyperwriteai.com/favicon.ico",
    url: "https://hyperwriteai.com/",
    category: "Escritura",
    description: "Asistente de escritura avanzado con IA",
    isAI: true
  },
  {
    id: "imagica",
    name: "Imagica",
    icon: "https://www.imagica.ai/favicon.ico",
    url: "https://www.imagica.ai/",
    category: "Imagen",
    description: "Creador de imágenes creativas y artísticas con IA",
    isAI: true
  },
  {
    id: "instantly-ai",
    name: "Instantly AI",
    icon: "https://instantly.ai/favicon.ico",
    url: "https://instantly.ai/",
    category: "Marketing",
    description: "Plataforma de automatización de emails con IA",
    isAI: true
  },
  {
    id: "invideo",
    name: "Invideo",
    icon: "https://invideo.io/favicon.ico",
    url: "https://invideo.io/",
    category: "Video",
    description: "Editor de vídeo online con plantillas y IA",
    isAI: true
  },
  {
    id: "jasper",
    name: "Jasper",
    icon: "https://www.jasper.ai/favicon.ico",
    url: "https://www.jasper.ai/",
    category: "Marketing",
    description: "Asistente de marketing y contenido con IA",
    isAI: true
  },
  {
    id: "jenni-ai",
    name: "Jenni AI",
    icon: "https://jenni.ai/favicon.ico",
    url: "https://jenni.ai/",
    category: "Escritura",
    description: "Asistente de escritura académica y profesional con IA",
    isAI: true
  },
  {
    id: "looka",
    name: "Looka",
    icon: "https://looka.com/favicon.ico",
    url: "https://looka.com/",
    category: "Diseño",
    description: "Diseño de logos e identidad de marca con IA",
    isAI: true
  },
  {
    id: "lucidpic",
    name: "Lucidpic",
    icon: "https://lucidpic.com/favicon.ico",
    url: "https://lucidpic.com/",
    category: "Imagen",
    description: "Generador de imágenes realistas con IA",
    isAI: true
  },
  {
    id: "madgicx",
    name: "Madgicx",
    icon: "https://madgicx.com/favicon.ico",
    url: "https://madgicx.com/",
    category: "Marketing",
    description: "Plataforma de marketing para Facebook e Instagram con IA",
    isAI: true
  },
  {
    id: "mem-ai",
    name: "Mem AI",
    icon: "https://mem.ai/favicon.ico",
    url: "https://mem.ai/",
    category: "Productividad",
    description: "Organizador de notas con IA que se adapta a tu forma de pensar",
    isAI: true
  },
  {
    id: "monica",
    name: "Monica",
    icon: "https://monica.im/favicon.ico",
    url: "https://monica.im/",
    category: "Asistentes",
    description: "Asistente personal con IA para tareas diarias",
    isAI: true
  },
  {
    id: "namecheap",
    name: "Namecheap",
    icon: "https://www.namecheap.com/favicon.ico",
    url: "https://www.namecheap.com/",
    category: "Desarrollo",
    description: "Registro de dominios con herramientas de IA",
    isAI: true
  },
  {
    id: "napkin-ai",
    name: "Napkin AI",
    icon: "https://www.napkin.ai/favicon.ico",
    url: "https://www.napkin.ai/",
    category: "Desarrollo",
    description: "Convierte ideas en código utilizando IA",
    isAI: true
  },
  {
    id: "notion",
    name: "Notion",
    icon: "https://www.notion.so/favicon.ico",
    url: "https://www.notion.so/",
    category: "Productividad",
    description: "Plataforma todo en uno para notas, tareas y bases de datos",
    isAI: true
  },
  {
    id: "ossa",
    name: "Ossa",
    icon: "https://ossa.ai/favicon.ico",
    url: "https://ossa.ai/",
    category: "Audio",
    description: "Transcripción y análisis de audio con IA",
    isAI: true
  },
  {
    id: "otter-ai",
    name: "Otter AI",
    icon: "https://otter.ai/favicon.ico",
    url: "https://otter.ai/",
    category: "Audio",
    description: "Transcripción de reuniones en tiempo real con IA",
    isAI: true
  },
  {
    id: "pebblely",
    name: "Pebblely",
    icon: "https://pebblely.com/favicon.ico",
    url: "https://pebblely.com/",
    category: "Imagen",
    description: "Creador de fondos y escenarios de producto con IA",
    isAI: true
  },
  {
    id: "pencil",
    name: "Pencil",
    icon: "https://www.pencil.ai/favicon.ico",
    url: "https://www.pencil.ai/",
    category: "Marketing",
    description: "Generador de anuncios creativos con IA",
    isAI: true
  },
  {
    id: "phind",
    name: "Phind",
    icon: "https://www.phind.com/favicon.ico",
    url: "https://www.phind.com/",
    category: "Desarrollo",
    description: "Motor de búsqueda para desarrolladores con IA",
    isAI: true
  },
  {
    id: "plai",
    name: "Plai",
    icon: "https://plai.io/favicon.ico",
    url: "https://plai.io/",
    category: "Marketing",
    description: "Planificación y gestión de marketing digital con IA",
    isAI: true
  },
  {
    id: "playground",
    name: "Playground",
    icon: "https://playground.ai/favicon.ico",
    url: "https://playground.ai/",
    category: "Imagen",
    description: "Plataforma para experimentar con IA generativa",
    isAI: true
  },
  {
    id: "pollo-ai",
    name: "Pollo AI",
    icon: "https://www.pollo.ai/favicon.ico",
    url: "https://www.pollo.ai/",
    category: "Marketing",
    description: "Automatización de marketing por email con IA",
    isAI: true
  },
  {
    id: "regie-ai",
    name: "Regie AI",
    icon: "https://www.regie.ai/favicon.ico",
    url: "https://www.regie.ai/",
    category: "Ventas",
    description: "Automatización de ventas y contenido con IA",
    isAI: true
  },
  {
    id: "runway",
    name: "Runway",
    icon: "https://runway.com/favicon.ico",
    url: "https://runway.com/",
    category: "Video",
    description: "Herramientas creativas de vídeo con IA",
    isAI: true
  },
  {
    id: "safurai",
    name: "Safurai",
    icon: "https://www.safurai.com/favicon.ico",
    url: "https://www.safurai.com/",
    category: "Desarrollo",
    description: "Asistente de código seguro con IA",
    isAI: true
  },
  {
    id: "seaart",
    name: "SeaArt",
    icon: "https://www.seaart.ai/favicon.ico",
    url: "https://www.seaart.ai/",
    category: "Imagen",
    description: "Generación de arte marino y acuático con IA",
    isAI: true
  },
  {
    id: "seamless-ai",
    name: "Seamless AI",
    icon: "https://www.seamless.ai/favicon.ico",
    url: "https://www.seamless.ai/",
    category: "Ventas",
    description: "Plataforma de generación de leads con IA",
    isAI: true
  },
  {
    id: "seo-bot",
    name: "SEO Bot",
    icon: "https://seobot.ai/favicon.ico",
    url: "https://seobot.ai/",
    category: "SEO",
    description: "Asistente de optimización SEO con IA",
    isAI: true
  },
  {
    id: "shuffle",
    name: "Shuffle",
    icon: "https://shuffle.ai/favicon.ico",
    url: "https://shuffle.ai/",
    category: "Diseño",
    description: "Creador de diseños y landing pages con IA",
    isAI: true
  },
  {
    id: "simplified-ai",
    name: "Simplified AI",
    icon: "https://simplified.com/favicon.ico",
    url: "https://simplified.com/ai-writer",
    category: "Escritura",
    description: "Editor de textos y contenidos con IA",
    isAI: true
  },
  {
    id: "suno",
    name: "Suno",
    icon: "https://suno.ai/favicon.ico",
    url: "https://suno.ai/",
    category: "Audio",
    description: "Generación de música con IA",
    isAI: true
  },
  {
    id: "taplio",
    name: "Taplio",
    icon: "https://taplio.com/favicon.ico",
    url: "https://taplio.com/",
    category: "Redes Sociales",
    description: "Asistente de LinkedIn potenciado por IA",
    isAI: true
  },
  {
    id: "taskade",
    name: "Taskade",
    icon: "https://www.taskade.com/favicon.ico",
    url: "https://www.taskade.com/",
    category: "Productividad",
    description: "Gestor de tareas y notas colaborativo con IA",
    isAI: true
  },
  {
    id: "tidv",
    name: "TI;dv",
    icon: "https://tldv.io/favicon.ico",
    url: "https://tldv.io/",
    category: "Video",
    description: "Grabación y transcripción de reuniones con IA",
    isAI: true
  },
  {
    id: "uizard",
    name: "Uizard",
    icon: "https://uizard.io/favicon.ico",
    url: "https://uizard.io/",
    category: "Diseño",
    description: "Transformación de bocetos en interfaces con IA",
    isAI: true
  },
  {
    id: "vidiq",
    name: "VidiQ",
    icon: "https://vidiq.com/favicon.ico",
    url: "https://vidiq.com/",
    category: "Video",
    description: "Optimización de vídeos para YouTube con IA",
    isAI: true
  },
  {
    id: "windsurf",
    name: "Windsurf",
    icon: "https://windsurf.ai/favicon.ico",
    url: "https://windsurf.ai/",
    category: "Marketing",
    description: "Análisis de datos de marketing con IA predictiva",
    isAI: true
  },
  {
    id: "wix",
    name: "Wix",
    icon: "https://www.wix.com/favicon.ico",
    url: "https://www.wix.com/",
    category: "Desarrollo",
    description: "Creador de sitios web con funciones de IA",
    isAI: true
  },
  {
    id: "word-stream",
    name: "Word Stream",
    icon: "https://www.wordstream.com/wp-content/uploads/2022/03/favicon-32x32.png",
    url: "https://www.wordstream.com/",
    category: "Marketing",
    description: "Optimización de campañas publicitarias con IA",
    isAI: true
  },
  {
    id: "writesonic",
    name: "Writesonic",
    icon: "https://writesonic.com/favicon.ico",
    url: "https://writesonic.com/",
    category: "Escritura",
    description: "Creador de contenido y textos con IA",
    isAI: true
  },
  {
    id: "zapier",
    name: "Zapier",
    icon: "https://cdn.zapier.com/zapier/images/favicon.ico",
    url: "https://zapier.com/",
    category: "Productividad",
    description: "Automatización de flujos de trabajo con funciones de IA",
    isAI: true
  },

  // Entertainment apps from additionalApps.ts
  {
    id: "netflix",
    name: "Netflix",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    url: "https://www.netflix.com",
    category: "Entretenimiento",
    description: "Servicio de streaming con series, películas y documentales",
    isAI: false
  },
  {
    id: "disney-plus",
    name: "Disney+",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    url: "https://www.disneyplus.com",
    category: "Entretenimiento",
    description: "Plataforma de streaming de Disney, Pixar, Marvel, Star Wars y National Geographic",
    isAI: false
  },
  {
    id: "hbo",
    name: "HBO",
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
    url: "https://www.hbo.com",
    category: "Entretenimiento",
    description: "Plataforma de streaming con series y películas exclusivas",
    isAI: false
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.svg",
    url: "https://www.primevideo.com",
    category: "Entretenimiento",
    description: "Servicio de streaming de Amazon con películas, series y contenido original",
    isAI: false
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg",
    url: "https://www.spotify.com",
    category: "Entretenimiento",
    description: "Servicio de streaming de música, podcasts y audiolibros",
    isAI: false
  },
  {
    id: "apple-music",
    name: "Apple Music",
    icon: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Apple_Music_logo.svg",
    url: "https://music.apple.com",
    category: "Entretenimiento",
    description: "Servicio de streaming musical de Apple",
    isAI: false
  },
  {
    id: "youtube-music",
    name: "YouTube Music",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg",
    url: "https://music.youtube.com",
    category: "Entretenimiento",
    description: "Servicio de streaming musical de YouTube",
    isAI: false
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    url: "https://www.youtube.com",
    category: "Entretenimiento",
    description: "Plataforma para compartir y ver videos",
    isAI: false
  },
  {
    id: "youtube-kids",
    name: "YouTube Kids",
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/fb/YouTube_Kids_LogoVector.svg",
    url: "https://www.youtubekids.com",
    category: "Entretenimiento",
    description: "Versión de YouTube diseñada para niños",
    isAI: false
  },

  // Productivity apps from additionalApps.ts
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
    url: "https://drive.google.com",
    category: "Productividad",
    description: "Almacenamiento en la nube y edición colaborativa de documentos",
    isAI: false
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
    url: "https://sheets.google.com",
    category: "Productividad",
    description: "Hojas de cálculo en línea de Google",
    isAI: false
  },
  {
    id: "google-docs",
    name: "Google Docs",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg",
    url: "https://docs.google.com",
    category: "Productividad",
    description: "Procesador de textos en línea de Google",
    isAI: false
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/47/Dropbox_logo_%282013-2020%29.svg",
    url: "https://www.dropbox.com",
    category: "Productividad",
    description: "Servicio de alojamiento de archivos en la nube",
    isAI: false
  },
  {
    id: "excel-online",
    name: "Excel Online",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg",
    url: "https://www.office.com/launch/excel",
    category: "Productividad",
    description: "Versión web de Microsoft Excel",
    isAI: false
  },
  {
    id: "word-online",
    name: "Word Online",
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg",
    url: "https://www.office.com/launch/word",
    category: "Productividad",
    description: "Versión web de Microsoft Word",
    isAI: false
  },
  {
    id: "powerpoint-online",
    name: "PowerPoint Online",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg",
    url: "https://www.office.com/launch/powerpoint",
    category: "Productividad",
    description: "Versión web de Microsoft PowerPoint",
    isAI: false
  },
  {
    id: "onedrive",
    name: "OneDrive",
    icon: "https://upload.wikimedia.org/wikipedia/commons/b/b4/OneDrive_icon.svg",
    url: "https://onedrive.live.com",
    category: "Productividad",
    description: "Servicio de almacenamiento en la nube de Microsoft",
    isAI: false
  },
  {
    id: "icloud",
    name: "iCloud",
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    url: "https://www.icloud.com",
    category: "Productividad",
    description: "Servicio de almacenamiento en la nube de Apple",
    isAI: false
  },
  {
    id: "google-fotos",
    name: "Google Fotos",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Google_Photos_icon.svg",
    url: "https://photos.google.com",
    category: "Productividad",
    description: "Servicio de almacenamiento y compartición de fotos",
    isAI: false
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    url: "https://mail.google.com",
    category: "Productividad",
    description: "Servicio de correo electrónico de Google",
    isAI: false
  },
  {
    id: "outlook",
    name: "Outlook",
    icon: "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg",
    url: "https://outlook.live.com",
    category: "Productividad",
    description: "Servicio de correo electrónico de Microsoft",
    isAI: false
  },
  {
    id: "google-keep",
    name: "Google Keep",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Keep_icon_%282020%29.svg",
    url: "https://keep.google.com",
    category: "Productividad",
    description: "Servicio de notas de Google",
    isAI: false
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    url: "https://calendar.google.com",
    category: "Productividad",
    description: "Calendario en línea de Google",
    isAI: false
  },
  {
    id: "power-bi",
    name: "Power BI",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Power_BI_logo.svg",
    url: "https://app.powerbi.com",
    category: "Productividad",
    description: "Servicio de análisis de datos de Microsoft",
    isAI: false
  },
  {
    id: "prezi",
    name: "Prezi",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Prezi_Logo.svg",
    url: "https://prezi.com",
    category: "Productividad",
    description: "Software de presentaciones alternativo a PowerPoint",
    isAI: false
  },
  {
    id: "todo",
    name: "Microsoft To Do",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Microsoft_To-Do_icon.svg",
    url: "https://to-do.microsoft.com",
    category: "Productividad",
    description: "Aplicación de gestión de tareas de Microsoft",
    isAI: false
  },
  {
    id: "slack",
    name: "Slack",
    icon: "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_128.png",
    url: "https://slack.com",
    category: "Productividad",
    description: "Plataforma de comunicación en equipo",
    isAI: false
  },
  {
    id: "trello",
    name: "Trello",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Trello-logo-blue.svg",
    url: "https://trello.com",
    category: "Productividad",
    description: "Herramienta de gestión de proyectos basada en tableros",
    isAI: false
  },
  {
    id: "clickup",
    name: "ClickUp",
    icon: "https://clickup.com/landing/images/clickup-logo.svg",
    url: "https://clickup.com",
    category: "Productividad",
    description: "Plataforma de productividad todo en uno",
    isAI: false
  },
  {
    id: "anydo",
    name: "Any.do",
    icon: "https://static.any.do/web/v2/images/new_design/favicon.svg",
    url: "https://www.any.do",
    category:
