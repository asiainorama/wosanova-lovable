
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';

interface AppGridProps {
  apps: AppData[];
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  listView?: boolean; // New prop to enable list view
}

const AppGrid: React.FC<AppGridProps> = ({ 
  apps, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  listView = false
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
          ? "featured-app-grid" 
          : "app-grid"
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
