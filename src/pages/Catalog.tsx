
import React from 'react';
import { useCatalogLogic } from '@/hooks/useCatalogLogic';
import CatalogContent from '@/components/catalog/CatalogContent';
import ScreenOverlay from '@/components/overlay/ScreenOverlay';

const Catalog = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    loading,
    filteredApps
  } = useCatalogLogic();

  const selectCategory = (category: string | null) => {
    setSearchTerm('');
    setSelectedCategory(category);
    document.getElementById('catalog-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ScreenOverlay id="catalog-container" className="catalog-background text-foreground">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
        <CatalogContent 
          loading={loading}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          apps={filteredApps}
          onCategoryChange={selectCategory}
          onClear={() => selectCategory(null)}
        />
      </div>
    </ScreenOverlay>
  );
};

export default Catalog;
