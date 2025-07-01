
import React from 'react';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useCatalogLogic } from '@/hooks/useCatalogLogic';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogContent from '@/components/catalog/CatalogContent';

const Catalog = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    loading,
    processedApps
  } = useCatalogLogic();
  
  useScrollBehavior();

  return (
    <div id="catalog-container" className="min-h-screen bg-gray-100 dark:bg-gray-950 overflow-y-auto flex flex-col">
      <CatalogHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        <CatalogContent 
          loading={loading}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          processedApps={processedApps}
        />
      </div>
    </div>
  );
};

export default Catalog;
