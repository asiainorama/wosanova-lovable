
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';

interface AppGridProps {
  apps: AppData[];
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  listView?: boolean;
  compact?: boolean;
}

const AppGrid: React.FC<AppGridProps> = ({ 
  apps, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  listView = false,
  compact = false
}) => {
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  return (
    <div className={
      listView 
        ? "space-y-2" 
        : isLarge 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
          : compact
            ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    }>
      {apps.map((app) => (
        <AppCard 
          key={app.id} 
          app={app} 
          showRemove={showRemove}
          showManage={showManage}
          onShowDetails={onShowDetails}
          isLarge={isLarge}
          listView={listView}
        />
      ))}
    </div>
  );
};

export default AppGrid;
