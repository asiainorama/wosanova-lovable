import React from 'react';
import Header from '@/components/Header';

const CatalogHeader: React.FC = () => {
  return (
    <div className="sticky top-0 z-50">
      <Header title="Catálogo" />
    </div>
  );
};

export default CatalogHeader;