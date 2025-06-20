
import React from 'react';
import { AppData } from '@/data/apps';
import CarouselGridCell from './CarouselGridCell';
import { calculateMinCellHeight } from '@/utils/gridCalculator';

interface CarouselGridPageProps {
  pageApps: (AppData | null)[];
  pageIndex: number;
  gridConfig: { cols: number; rows: number };
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
}

const CarouselGridPage: React.FC<CarouselGridPageProps> = ({
  pageApps,
  pageIndex,
  gridConfig,
  showRemove = false,
  showManage = false,
  onShowDetails,
  smallerIcons = false,
}) => {
  const cellHeight = calculateMinCellHeight(gridConfig.rows);
  const isLandscapeMobile = gridConfig.rows === 2 && window.innerWidth > window.innerHeight && window.innerWidth < 768;
  
  return (
    <div className="h-full w-full px-1 flex items-center justify-center will-change-transform">
      <div
        className="w-full grid-container-evenly"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          alignContent: 'space-evenly',
          justifyContent: 'space-evenly',
          padding: isLandscapeMobile ? '0.5% 1%' : '1% 2%', // Less padding for landscape mobile
          width: '100%',
          // More height for mobile landscape to accommodate text properly
          height: isLandscapeMobile ? `calc(100vh - 140px)` : `calc(100vh - 200px)`,
          margin: '0 auto',
          maxWidth: 'min(100%, 1200px)',
          gap: isLandscapeMobile ? '2px' : '8px' // Much smaller gap for mobile landscape
        }}
      >
        {pageApps.map((app, index) => (
          <CarouselGridCell 
            key={`cell-${pageIndex}-${index}`}
            app={app}
            pageIndex={pageIndex}
            index={index}
            rows={gridConfig.rows}
            showRemove={showRemove}
            showManage={showManage}
            onShowDetails={onShowDetails}
            smallerIcons={smallerIcons}
            cellHeight={cellHeight}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(CarouselGridPage);
