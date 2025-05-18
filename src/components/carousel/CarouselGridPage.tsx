
import React from 'react';
import { AppData } from '@/data/apps';
import CarouselGridCell from './CarouselGridCell';

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
  return (
    <div className="h-full w-full px-1 flex items-center justify-center will-change-transform">
      <div
        className="w-full h-full grid-container-evenly"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          alignContent: 'space-evenly',
          justifyContent: 'space-evenly',
          padding: '2% 3%', // Reduced padding from previous values
          width: '100%',
          height: '100%',
          margin: '0 auto',
          maxWidth: 'min(100%, 1200px)'
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
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(CarouselGridPage);
