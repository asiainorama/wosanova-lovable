
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
  return (
    <div 
      key={`${pageIndex}-${app ? app.id : `empty-${index}`}`} 
      className="app-grid-item flex flex-col justify-start items-center"
      style={{
        height: cellHeight || 'auto',
        minHeight: cellHeight || `${100/rows}%`
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
        />
      ) : (
        <div className="empty-slot w-full h-full opacity-0"></div>
      )}
    </div>
  );
};

export default React.memo(CarouselGridCell);
