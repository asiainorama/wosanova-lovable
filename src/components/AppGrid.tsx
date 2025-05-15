
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';

interface AppGridProps {
  apps: AppData[];
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  compact?: boolean;
  moreCompact?: boolean;
  smallerIcons?: boolean;
}

const AppGrid: React.FC<AppGridProps> = ({ 
  apps, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  compact = false,
  moreCompact = false,
  smallerIcons = false
}) => {
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  // Clase para la cuadrícula adaptativa según los tamaños de pantalla
  const gridClass = isLarge 
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
    : compact && !moreCompact
      ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
      : moreCompact 
        ? "grid grid-cols-4 portrait:grid-cols-4 landscape:sm:grid-cols-5 md:portrait:grid-cols-4 md:landscape:grid-cols-6 lg:grid-cols-8 gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  return (
    <div className={gridClass}>
      {apps.map((app) => (
        <AppCard 
          key={app.id} 
          app={app} 
          showRemove={showRemove}
          showManage={showManage}
          onShowDetails={onShowDetails}
          isLarge={isLarge}
          smallerIcons={smallerIcons}
        />
      ))}
    </div>
  );
};

export default AppGrid;
