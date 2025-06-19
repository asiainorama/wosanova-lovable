
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from '../AppCard';

interface SimpleAppGridProps {
  apps: AppData[];
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  compact?: boolean;
  moreCompact?: boolean;
  smallerIcons?: boolean;
}

const SimpleAppGrid: React.FC<SimpleAppGridProps> = ({ 
  apps,
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  compact = false,
  moreCompact = false,
  smallerIcons = false
}) => {
  const getGridClasses = () => {
    if (isLarge) {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
    }
    if (moreCompact) {
      return "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-4";
    }
    if (compact) {
      return "grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9 gap-4";
    }
    return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
  };

  return (
    <div className={getGridClasses()}>
      {apps.map((app, index) => (
        <AppCard 
          key={app.id} 
          app={app} 
          showRemove={showRemove}
          showManage={showManage}
          onShowDetails={onShowDetails}
          isLarge={isLarge}
          smallerIcons={smallerIcons}
          index={index}
        />
      ))}
    </div>
  );
};

export default React.memo(SimpleAppGrid);
