
import React from 'react';
import { AppData } from '@/data/apps';
import AppCard from '../AppCard';

interface CarouselGridCellProps {
  app: AppData | null;
  pageIndex: number;
  index: number;
  rows: number;
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
  cellHeight?: string;
}

const CarouselGridCell: React.FC<CarouselGridCellProps> = ({
  app,
  pageIndex,
  index,
  rows,
  showRemove = false,
  showManage = false,
  onShowDetails,
  smallerIcons = false,
  cellHeight
}) => {
  // Calculate the global index for staggered animation
  const globalIndex = pageIndex * rows + index;

  // Ajustar altura para asegurar espacio suficiente para nombres
  const adjustedCellHeight = cellHeight || 'auto';
  const minHeight = rows === 2 
    ? 'calc(45vh - 80px)' // Móvil horizontal: menos altura pero suficiente
    : `calc(${100/rows}vh - 40px)`; // Otros casos: altura proporcional menos margen

  return (
    <div 
      key={`${pageIndex}-${app ? app.id : `empty-${index}`}`} 
      className="app-grid-item flex flex-col justify-start items-center opacity-0 animate-fade-in px-1 transform translate-y-3"
      style={{
        height: adjustedCellHeight,
        minHeight: minHeight,
        maxWidth: '100%',
        animationDelay: `${globalIndex * 30}ms`,
        animationFillMode: 'forwards',
        animationDuration: '450ms',
        animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'visible' // Permitir que el contenido sea visible
      }}
    >
      {app ? (
        <AppCard 
          app={app} 
          showRemove={showRemove}
          showManage={showManage}
          onShowDetails={onShowDetails}
          isLarge={false}
          smallerIcons={smallerIcons}
          index={globalIndex}
        />
      ) : (
        <div className="empty-slot w-full h-full opacity-0"></div>
      )}
    </div>
  );
};

export default React.memo(CarouselGridCell);
