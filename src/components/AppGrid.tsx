
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import { useScreenSize } from '@/hooks/use-screen-size';

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
  const { isMobile, isTablet, isDesktop, isPortrait, isLandscape } = useScreenSize();
  
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  // Determinar el número de columnas según el tamaño de pantalla
  // Clase para la cuadrícula adaptativa según los tamaños de pantalla
  const gridClass = isLarge 
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
    : compact && !moreCompact
      ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
      : moreCompact 
        ? "grid grid-cols-4 portrait:grid-cols-4 landscape:sm:grid-cols-5 md:portrait:grid-cols-4 md:landscape:grid-cols-6 lg:grid-cols-8 gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  // Determinar el número de filas según el tamaño y orientación de la pantalla
  let maxItems = apps.length;
  
  if (compact || moreCompact) {
    // Limitar el número de elementos según el diseño solicitado
    if (isMobile && isPortrait) {
      // Móvil vertical: 4 columnas x 6 filas = 24 elementos
      maxItems = 4 * 6;
    } else if (isMobile && isLandscape) {
      // Móvil horizontal: 5 columnas x 2 filas = 10 elementos
      maxItems = 5 * 2;
    } else if (isTablet && isPortrait) {
      // Tablet vertical: 4 columnas x 6 filas = 24 elementos
      maxItems = 4 * 6;
    } else if (isTablet && isLandscape) {
      // Tablet horizontal: 6 columnas x 4 filas = 24 elementos
      maxItems = 6 * 4;
    } else if (isDesktop) {
      // Pantallas grandes: 8 columnas x 6 filas = 48 elementos
      maxItems = 8 * 6;
    }
  }

  // Limitar los elementos a mostrar según el cálculo anterior
  const visibleApps = apps.slice(0, maxItems);

  return (
    <div className={gridClass}>
      {visibleApps.map((app) => (
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
