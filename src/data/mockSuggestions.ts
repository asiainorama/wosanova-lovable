import { WebappSuggestion } from '@/services/WebappSuggestionsService';

export const mockSuggestions: WebappSuggestion[] = [
  {
    id: 'mock-1',
    nombre: 'ChatGPT Plus',
    url: 'https://chat.openai.com',
    descripcion: 'Asistente de IA conversacional avanzado para generar texto, resolver problemas y ayudar con tareas creativas.',
    icono_url: 'https://cdn.oaistatic.com/_next/static/media/apple-touch-icon.82af6fe1.png',
    usa_ia: true,
    categoria: 'Productividad',
    etiquetas: ['ia', 'chat', 'asistente'],
    estado: 'borrador' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    nombre: 'Midjourney',
    url: 'https://midjourney.com',
    descripcion: 'Generador de imágenes con IA que crea arte digital impresionante a partir de descripciones de texto.',
    icono_url: 'https://midjourney.com/apple-touch-icon.png',
    usa_ia: true,
    categoria: 'Creatividad',
    etiquetas: ['ia', 'arte', 'imágenes'],
    estado: 'borrador' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    nombre: 'Spotify Web Player',
    url: 'https://open.spotify.com',
    descripcion: 'Plataforma de streaming de música con millones de canciones, podcasts y playlists personalizadas.',
    icono_url: 'https://open.spotifycdn.com/cdn/images/favicon32.a19b4f5b.png',
    usa_ia: false,
    categoria: 'Entretenimiento',
    etiquetas: ['música', 'streaming', 'audio'],
    estado: 'borrador' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];