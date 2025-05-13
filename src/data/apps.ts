
import { AppData } from './types';

// Default categories
export const categories = [
  "Productividad", "Organización", "Entretenimiento", "Juegos", "Multimedia",
  "Educación", "Social", "Utilidades", "Herramientas", "Desarrollo",
  "Trabajo", "Estilo de vida", "Salud", "Fitness", "Viajes", "Finanzas",
  "Negocios", "Compras", "Arte", "Fotografía", "Música", "IA",
  "Redes Sociales", "Comunicación", "Libros", "Almacenamiento", "Diseño",
  "Noticias", "Criptomonedas", "Comida", "Inmobiliaria", "Inversión"
];

// Define category groups
export interface CategoryGroup {
  name: string;
  categories: string[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    name: "Productivity",
    categories: [
      "Productividad", "Organización", "Trabajo", "Educación", 
      "Desarrollo", "Herramientas", "Diseño", "Libros", "Almacenamiento", "Escritura"
    ]
  },
  {
    name: "Entertainment",
    categories: [
      "Entretenimiento", "Juegos", "Multimedia", "Social", 
      "Música", "Arte", "Fotografía", "Video", "Audio"
    ]
  },
  {
    name: "Utilities",
    categories: [
      "Utilidades", "Herramientas", "Comunicación", "Noticias", "IA", "Asistentes", "SEO"
    ]
  },
  {
    name: "Lifestyle",
    categories: [
      "Estilo de vida", "Salud", "Fitness", "Viajes", "Comida", "Inmobiliaria"
    ]
  },
  {
    name: "Finance",
    categories: [
      "Finanzas", "Negocios", "Compras", "Inversión", "Criptomonedas", 
      "Marketing", "Ventas"
    ]
  }
];

// Export the AppData type for convenience
export type { AppData };
