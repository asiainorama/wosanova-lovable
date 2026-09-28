
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
    filteredApps
  } = useCatalogLogic();
  
  useScrollBehavior();

  const selectCategory = (category: string | null) => {
    setSearchTerm('');
    setSelectedCategory(category);
    document.getElementById('catalog-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="catalog-container" className="min-h-screen bg-background text-foreground overflow-y-auto flex flex-col">
      <CatalogHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CatalogContent 
          loading={loading}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          apps={filteredApps}
          onCategoryChange={selectCategory}
          onClear={() => selectCategory(null)}
        />
      </div>
    </div>
  );
};

export default Catalog;
