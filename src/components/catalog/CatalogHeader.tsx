import React from 'react';
import Header from '@/components/Header';

interface CatalogHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="sticky top-0 z-50">
      <Header 
        title="Catálogo"
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
};

export default CatalogHeader;