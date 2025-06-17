
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
  // Calculate the global index for staggered animation (much faster)
  const globalIndex = pageIndex * rows + index;
  const isLandscapeMobile = rows === 2 && window.innerWidth > window.innerHeight && window.innerWidth < 768;

  // Ajustar altura específicamente para móvil horizontal
  const adjustedCellHeight = isLandscapeMobile ? 'auto' : cellHeight;
  const minHeight = isLandscapeMobile 
    ? 'calc(45vh - 90px)' // Increased space for mobile landscape
    : rows === 2 
      ? 'calc(50vh - 100px)' 
      : cellHeight || `${100/rows}%`;

  return (
    <div 
      key={`${pageIndex}-${app ? app.id : `empty-${index}`}`} 
      className="app-grid-item flex flex-col justify-center items-center opacity-0 animate-fade-in px-1"
      style={{
        height: adjustedCellHeight,
        minHeight: minHeight,
        animationDelay: `${globalIndex * 15}ms`, // Much faster stagger (was 30ms)
        animationFillMode: 'forwards',
        animationDuration: '150ms' // Faster fade-in (was 200ms)
      }}
    >
      {app ? (
        <div className="flex flex-col items-center h-full justify-between py-1">
          <AppCard 
            app={app} 
            showRemove={showRemove}
            showManage={showManage}
            onShowDetails={onShowDetails}
            isLarge={false}
            smallerIcons={smallerIcons}
            index={globalIndex}
          />
        </div>
      ) : (
        <div className="empty-slot w-full h-full opacity-0"></div>
      )}
    </div>
  );
};

export default React.memo(CarouselGridCell);
