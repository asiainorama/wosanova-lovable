
import React from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Definimos los mismos grupos de categorías para consistencia
const categoryGroups = {
  'Productividad': ['Productividad', 'Herramientas', 'Organización', 'Documentos', 'Gestión', 'Business'],
  'Comunicación': ['Comunicación', 'Social', 'Email', 'Chat', 'Mensajería'],
  'Multimedia': ['Multimedia', 'Vídeo', 'Audio', 'Imágenes', 'Diseño', 'Gráficos'],
  'Educación': ['Educación', 'Aprendizaje', 'Idiomas', 'Conocimiento'],
  'Tecnología': ['Desarrollo', 'Programación', 'Tecnología', 'IA', 'Code', 'Tech'],
  'Entretenimiento': ['Juegos', 'Ocio', 'Entretenimiento', 'Música'],
  'Finanzas': ['Finanzas', 'Economía', 'Banca', 'Inversión'],
  'Otros': ['Otros', 'Viajes', 'Salud', 'Compras', 'Estilo de vida'] 
};

// Función para obtener el grupo de una categoría
const getCategoryGroup = (category: string) => {
  for (const [group, cats] of Object.entries(categoryGroups)) {
    if (cats.includes(category)) {
      return group;
    }
  }
  return 'Otros';
};

const Manage = () => {
  const { favorites, removeFromFavorites } = useAppContext();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={t('manage.title') || "Gestionar Apps"} />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('manage.favorites') || "Mis Aplicaciones Favoritas"}</h2>
          <div className="space-y-2">
            {favorites.length === 0 ? (
              <p className="text-gray-500">{t('manage.noApps') || "No hay aplicaciones que mostrar"}</p>
            ) : (
              favorites.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={app.icon}
                      alt={`${app.name} icon`}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div>
                      <h3 className="font-medium dark:text-white">{app.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {app.description} <span className="text-xs text-gray-400">({getCategoryGroup(app.category)})</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromFavorites(app.id)}
                    className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Manage;
