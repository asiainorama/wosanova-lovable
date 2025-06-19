
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppGridConfig } from '@/hooks/useAppGridConfig';
import SimpleAppGrid from './grid/SimpleAppGrid';
import CarouselAppGrid from './grid/CarouselAppGrid';

interface AppGridProps {
  apps: AppData[];
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  compact?: boolean;
  moreCompact?: boolean;
  smallerIcons?: boolean;
  useCarousel?: boolean;
  carouselKey?: string;
}

const AppGrid: React.FC<AppGridProps> = ({ 
  apps, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  compact = false,
  moreCompact = false,
  smallerIcons = false,
  useCarousel = false,
  carouselKey = ''
}) => {
  const { gridConfig } = useAppGridConfig(smallerIcons);
  
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  // Use carousel mode
  if (useCarousel) {
    return (
      <CarouselAppGrid
        apps={apps}
        gridConfig={gridConfig}
        showRemove={showRemove}
        showManage={showManage}
        onShowDetails={onShowDetails}
        smallerIcons={smallerIcons}
        carouselKey={carouselKey}
      />
    );
  }
  
  // Use simple grid mode
  return (
    <SimpleAppGrid
      apps={apps}
      showRemove={showRemove}
      showManage={showManage}
      onShowDetails={onShowDetails}
      isLarge={isLarge}
      compact={compact}
      moreCompact={moreCompact}
      smallerIcons={smallerIcons}
    />
  );
};

export default React.memo(AppGrid);
