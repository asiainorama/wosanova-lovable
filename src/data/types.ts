
export interface AppData {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: string;
  subcategory?: string; // Making subcategory optional with ?
  description: string;
  isAI: boolean;
  created_at?: string; // Making it optional with ?
  updated_at?: string; // Making it optional with ?
}
