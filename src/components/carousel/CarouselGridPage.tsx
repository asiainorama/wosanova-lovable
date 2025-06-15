
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
  
  return (
    <div className="h-full w-full px-1 flex items-start justify-center will-change-transform pt-2">
      <div
        className="w-full grid-container-evenly"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          alignContent: 'start',
          justifyContent: 'space-evenly',
          padding: '1% 2%',
          width: '100%',
          height: `calc(100vh - 200px)`, // More space for content
          margin: '0 auto',
          maxWidth: 'min(100%, 1200px)',
          gap: '4px 8px', // Reduced vertical gap, maintained horizontal
          alignItems: 'start' // Align items to start
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
