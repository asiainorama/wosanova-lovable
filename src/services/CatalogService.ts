import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/data/types';
import { toast } from 'sonner';

export class CatalogService {
  static mapAppData(data: any[]): AppData[] {
    return data.map(app => ({
      id: app.id,
      name: app.name,
      icon: app.icon,
      url: app.url,
      category: app.category,
      subcategory: app.subcategory,
      description: app.description,
      isAI: app.is_ai,
      created_at: app.created_at,
      updated_at: app.updated_at,
    }));
  }

  static async fetchApps(): Promise<AppData[]> {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    if (data) {
      console.info(`Loaded apps from Supabase: ${data.length}`);
      return this.mapAppData(data);
    }

    return [];
  }

  static filterApps(
    apps: AppData[], 
    searchTerm: string, 
    selectedCategory: string | null
  ): AppData[] {
    return apps.filter(app => {
      const matchesSearch = searchTerm.trim() 
        ? app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          app.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesCategory = !selectedCategory || app.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  static groupAppsByCategory(apps: AppData[]): Record<string, AppData[]> {
    const grouped: Record<string, AppData[]> = {};
    
    apps.forEach(app => {
      if (!grouped[app.category]) {
        grouped[app.category] = [];
      }
      grouped[app.category].push(app);
    });
    
    // Sort categories alphabetically and apps within each category
    const sortedCategories = Object.keys(grouped).sort();
    sortedCategories.forEach(category => {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }
}