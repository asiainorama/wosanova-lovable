
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

  // Ajustar altura mínima para móvil horizontal (2 filas)
  const adjustedCellHeight = rows === 2 ? 'auto' : cellHeight;
  const minHeight = rows === 2 ? 'calc(50vh - 80px)' : cellHeight || `${100/rows}%`;

  return (
    <div 
      key={`${pageIndex}-${app ? app.id : `empty-${index}`}`} 
      className="app-grid-item flex flex-col justify-start items-center opacity-0 animate-fade-in px-1 transform translate-y-3"
      style={{
        height: adjustedCellHeight,
        minHeight: minHeight,
        animationDelay: `${globalIndex * 30}ms`, // Slightly slower for better visual impact
        animationFillMode: 'forwards',
        animationDuration: '450ms', // Longer duration for smoother animation
        animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Bounce effect
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
