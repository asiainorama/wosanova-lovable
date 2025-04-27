
export interface AppData {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
  description: string;
  isAI: boolean;
}

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
    id: "notion-ai",
    name: "Notion AI",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
    url: "https://www.notion.so/product/ai",
    category: "Productividad",
    description: "Asistente de escritura integrado en Notion",
    isAI: true
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "https://assets-global.website-files.com/656bbef1dff242a5c3e794b8/6577c533af1e021a060d3f87_Logo.svg",
    url: "https://www.perplexity.ai",
    category: "Búsqueda",
    description: "Motor de búsqueda potenciado por IA",
    isAI: true
  },
  {
    id: "synthesia",
    name: "Synthesia",
    icon: "https://framerusercontent.com/images/AgfI6jpyNw0xggoQDXQOTgDXU.png",
    url: "https://www.synthesia.io",
    category: "Video",
    description: "Creación de videos con avatares de IA",
    isAI: true
  },
  {
    id: "descript",
    name: "Descript",
    icon: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Descript_Logo.svg",
    url: "https://www.descript.com",
    category: "Audio",
    description: "Editor de audio y video potenciado por IA",
    isAI: true
  },
  {
    id: "jasper",
    name: "Jasper",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Jasper_Logo.svg",
    url: "https://www.jasper.ai",
    category: "Escritura",
    description: "Plataforma de generación de contenido con IA",
    isAI: true
  },
  {
    id: "grammarly",
    name: "Grammarly",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Grammarly_logo.svg",
    url: "https://www.grammarly.com",
    category: "Escritura",
    description: "Asistente de escritura con IA",
    isAI: true
  },
  {
    id: "lensa",
    name: "Lensa AI",
    icon: "https://play-lh.googleusercontent.com/Wq15hCMyyBSwBuKpZYG-Xho0COG4FQZ2F6JAYBVx5Z-K4aIkU0Wzr_SYAU3y5xCUCbE",
    url: "https://prisma-ai.com/lensa",
    category: "Imagen",
    description: "Editor de fotos con herramientas de IA",
    isAI: true
  },
  {
    id: "runway",
    name: "Runway",
    icon: "https://runwayml.com/images/brand/image/runway-logo.png",
    url: "https://runwayml.com",
    category: "Video",
    description: "Creación de contenido visual con IA",
    isAI: true
  },
  {
    id: "eleven-labs",
    name: "ElevenLabs",
    icon: "https://upload.wikimedia.org/wikipedia/en/b/b5/ElevenLabs_logo.jpg",
    url: "https://elevenlabs.io",
    category: "Audio",
    description: "Síntesis de voz realista con IA",
    isAI: true
  },
  {
    id: "lovable",
    name: "Lovable",
    icon: "https://assets-global.website-files.com/6500a4ce2ad81c20de1d2f90/655afe53f4261a29accc1dba_lovable-gradient-logo.png",
    url: "https://lovable.dev",
    category: "Desarrollo",
    description: "Plataforma para crear aplicaciones web con IA",
    isAI: true
  },
  {
    id: "replicate",
    name: "Replicate",
    icon: "https://replicate.com/static/favicon.e9c33e9842d3.png",
    url: "https://replicate.com",
    category: "Desarrollo",
    description: "Plataforma para ejecutar modelos de IA en la nube",
    isAI: true
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    icon: "https://huggingface.co/favicon.ico",
    url: "https://huggingface.co",
    category: "Desarrollo",
    description: "Plataforma para modelos de IA de código abierto",
    isAI: true
  },
  {
    id: "adept",
    name: "Adept AI",
    icon: "https://assets-global.website-files.com/64354b8ce4142f81fc4c9703/643559ce13baf8688b88226f_adept-favicon-color.png",
    url: "https://www.adept.ai",
    category: "Asistentes",
    description: "Asistente de IA que puede interactuar con interfaces",
    isAI: true
  }
];

export const categories = [
  "Todas",
  "Asistentes",
  "Imagen",
  "Video",
  "Audio",
  "Escritura",
  "Productividad",
  "Desarrollo",
  "Búsqueda"
];
