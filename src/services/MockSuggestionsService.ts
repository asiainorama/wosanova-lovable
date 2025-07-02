import { WebappSuggestion } from '@/services/WebappSuggestionsService';
import { mockSuggestions } from '@/data/mockSuggestions';

// Servicio para manejar sugerencias mock en modo preview
class MockSuggestionsService {
  private suggestions: WebappSuggestion[] = [...mockSuggestions];

  getAllSuggestions(): WebappSuggestion[] {
    return this.suggestions.filter(s => s.estado === 'borrador');
  }

  updateSuggestion(id: string, updates: Partial<WebappSuggestion>): void {
    const index = this.suggestions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.suggestions[index] = {
        ...this.suggestions[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      console.log('Mock suggestion updated:', this.suggestions[index]);
    }
  }

  publishSuggestion(id: string): void {
    const index = this.suggestions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.suggestions[index] = {
        ...this.suggestions[index],
        estado: 'publicado' as const,
        updated_at: new Date().toISOString()
      };
      console.log('Mock suggestion published:', this.suggestions[index]);
    }
  }

  discardSuggestion(id: string): void {
    const index = this.suggestions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.suggestions[index] = {
        ...this.suggestions[index],
        estado: 'descartado' as const,
        updated_at: new Date().toISOString()
      };
      console.log('Mock suggestion discarded:', this.suggestions[index]);
    }
  }

  addMockSuggestions(count: number = 3): void {
    const newMockSuggestions: WebappSuggestion[] = [
      {
        id: `mock-${Date.now()}-1`,
        nombre: 'Notion AI',
        url: 'https://notion.so',
        descripcion: 'Workspace todo-en-uno con IA integrada para tomar notas, gestionar proyectos y bases de datos.',
        icono_url: 'https://notion.so/icons/apple-touch-icon.png',
        usa_ia: true,
        categoria: 'Productividad',
        etiquetas: ['notas', 'proyectos', 'ia'],
        estado: 'borrador' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `mock-${Date.now()}-2`,
        nombre: 'Figma',
        url: 'https://figma.com',
        descripcion: 'Herramienta de diseño colaborativo para crear interfaces de usuario y prototipos.',
        icono_url: 'https://static.figma.com/app/icon/1/favicon.ico',
        usa_ia: false,
        categoria: 'Creatividad',
        etiquetas: ['diseño', 'ui', 'colaboración'],
        estado: 'borrador' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `mock-${Date.now()}-3`,
        nombre: 'Coinbase',
        url: 'https://coinbase.com',
        descripcion: 'Plataforma de intercambio de criptomonedas fácil de usar para comprar, vender y almacenar.',
        icono_url: 'https://coinbase.com/img/favicon.ico',
        usa_ia: false,
        categoria: 'Finanzas',
        etiquetas: ['crypto', 'trading', 'wallet'],
        estado: 'borrador' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Solo agregar las que no existen ya
    newMockSuggestions.slice(0, count).forEach(suggestion => {
      if (!this.suggestions.find(s => s.id === suggestion.id)) {
        this.suggestions.push(suggestion);
      }
    });
  }

  reset(): void {
    this.suggestions = [...mockSuggestions];
  }
}

// Singleton instance
export const mockSuggestionsService = new MockSuggestionsService();