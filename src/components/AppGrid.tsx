
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';

interface AppGridProps {
  apps: AppData[];
  showRemove?: boolean;
}

const AppGrid: React.FC<AppGridProps> = ({ apps, showRemove = false }) => {
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  return (
    <div className="app-grid">
      {apps.map((app) => (
        <AppCard 
          key={app.id} 
          app={app} 
          showRemove={showRemove} 
        />
      ))}
    </div>
  );
};

export default AppGrid;
