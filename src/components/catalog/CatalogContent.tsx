
import React from 'react';
import AppGrid from '@/components/AppGrid';
import GradientSeparator from '@/components/ui/GradientSeparator';
import { AppData } from '@/data/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface CatalogContentProps {
  loading: boolean;
  selectedCategory: string | null;
  searchTerm: string;
  processedApps: AppData[] | Record<string, AppData[]>;
}

const CatalogContent: React.FC<CatalogContentProps> = ({
  loading,
  selectedCategory,
  searchTerm,
  processedApps
}) => {
  const { t } = useLanguage();

  if (loading) {
    return <LoadingIndicator />;
  }

  // Show all apps when no category is selected
  if (!selectedCategory) {
    const sortedApps = processedApps as AppData[];
    
    return (
      <>
        <h2 className="text-xl font-semibold mb-3 dark:text-white">{t('catalog.allCategories')}</h2>
        <GradientSeparator />
        {sortedApps.length > 0 ? (
          <AppGrid 
            apps={sortedApps}
            showRemove={false}
            showManage={false}
            onShowDetails={undefined}
          />
        ) : (
          <EmptyState searchTerm={searchTerm} />
        )}
      </>
    );
  }

  // Show grouped apps by category
  const groupedApps = processedApps as Record<string, AppData[]>;
  const sortedCategories = Object.keys(groupedApps).sort();

  return (
    <>
      {sortedCategories.length > 0 ? (
        sortedCategories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-3 dark:text-white">{category}</h2>
            <GradientSeparator />
            <AppGrid 
              apps={groupedApps[category]}
              showRemove={false}
              showManage={false}
              onShowDetails={undefined}
            />
          </div>
        ))
      ) : (
        <EmptyState 
          searchTerm={searchTerm} 
          selectedCategory={selectedCategory}
        />
      )}
    </>
  );
};

// Loading indicator component
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-full min-h-[60vh]">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ searchTerm: string; selectedCategory?: string | null }> = ({ 
  searchTerm, 
  selectedCategory 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center py-10">
      <p className="text-gray-500 dark:text-gray-400">
        {searchTerm.trim() 
          ? `No se encontraron aplicaciones que coincidan con "${searchTerm}"`
          : selectedCategory 
            ? `No hay aplicaciones en la categoría "${selectedCategory}"`
            : "No hay aplicaciones que coincidan con los criterios de búsqueda"
        }
      </p>
    </div>
  );
};

export default CatalogContent;
