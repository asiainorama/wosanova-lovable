
export interface AppData {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
  subcategory?: string; // Nueva propiedad opcional para subcategoría
  description: string;
  isAI: boolean;
  created_at?: string; // Making it optional with ?
  updated_at?: string; // Making it optional with ?
}
