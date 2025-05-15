
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import { useScreenSize } from '@/hooks/use-screen-size';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppGridProps {
  apps: AppData[];
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  compact?: boolean;
  moreCompact?: boolean;
  smallerIcons?: boolean;
  horizontalScroll?: boolean;
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
  horizontalScroll = false
}) => {
  const { isMobile, isTablet, isDesktop, isPortrait, isLandscape } = useScreenSize();
  
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  // Determinar los límites de filas y columnas según el dispositivo y orientación
  let rowCount = 6; // Valor por defecto
  let columnsPerRow = 8; // Valor por defecto

  if (isMobile && isPortrait) {
    // Móvil vertical: 4 columnas x 6 filas
    columnsPerRow = 4;
    rowCount = 6;
  } else if (isMobile && isLandscape) {
    // Móvil horizontal: 5 columnas x 2 filas
    columnsPerRow = 5;
    rowCount = 2;
  } else if (isTablet && isPortrait) {
    // Tablet vertical: 4 columnas x 6 filas
    columnsPerRow = 4;
    rowCount = 6;
  } else if (isTablet && isLandscape) {
    // Tablet horizontal: 6 columnas x 4 filas
    columnsPerRow = 6;
    rowCount = 4;
  } else if (isDesktop) {
    // Pantallas grandes: 8 columnas x 6 filas
    columnsPerRow = 8;
    rowCount = 6;
  }

  // Clase para la cuadrícula adaptativa según los tamaños de pantalla
  const gridClass = isLarge 
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
    : compact && !moreCompact
      ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
      : moreCompact 
        ? "grid grid-cols-4 portrait:grid-cols-4 landscape:sm:grid-cols-5 md:portrait:grid-cols-4 md:landscape:grid-cols-6 lg:grid-cols-8 gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  // Determinar el número máximo de elementos
  let maxItems = apps.length;
  
  // Solo aplicamos límites si no usamos scroll horizontal
  if ((compact || moreCompact) && !horizontalScroll) {
    maxItems = columnsPerRow * rowCount;
  }

  // Organizamos los elementos en grupos de filas para scroll horizontal
  const organizeIntoRows = (apps: AppData[], columnsPerRow: number): AppData[][] => {
    const rows: AppData[][] = [];
    if (horizontalScroll) {
      // En scroll horizontal, necesitamos organizar en filas para mantener la estructura
      for (let i = 0; i < apps.length; i += columnsPerRow) {
        rows.push(apps.slice(i, i + columnsPerRow));
      }
      // Limitamos a un número máximo de filas
      return rows.slice(0, rowCount);
    } else {
      // Si no hay scroll horizontal, simplemente devolvemos todos los elementos en una matriz
      return [apps.slice(0, maxItems)];
    }
  };

  const rows = organizeIntoRows(apps, columnsPerRow);
  const visibleApps = rows.flat().slice(0, horizontalScroll ? rows.flat().length : maxItems);

  const renderRow = (rowApps: AppData[]) => (
    <div className="grid grid-flow-col auto-cols-max gap-4">
      {rowApps.map((app) => (
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

  const renderGrid = () => (
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

  if (horizontalScroll) {
    return (
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex flex-col gap-6 pb-4">
          {rows.map((rowApps, index) => (
            <div key={index} className="min-w-max">
              {renderRow(rowApps)}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return renderGrid();
};

export default AppGrid;
