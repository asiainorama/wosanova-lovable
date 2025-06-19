
import React from 'react';
import { AppData } from '@/data/apps';
import SwiperCarousel from '../SwiperCarousel';

interface CarouselAppGridProps {
  apps: AppData[];
  gridConfig: { cols: number; rows: number };
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
  carouselKey?: string;
}

const CarouselAppGrid: React.FC<CarouselAppGridProps> = ({
  apps,
  gridConfig,
  showRemove = false,
  showManage = false,
  onShowDetails,
  smallerIcons = false,
  carouselKey = ''
}) => {
  return (
    <SwiperCarousel
      apps={apps}
      gridConfig={gridConfig}
      showRemove={showRemove}
      showManage={showManage}
      onShowDetails={onShowDetails}
      smallerIcons={smallerIcons}
      carouselKey={carouselKey}
    />
  );
};

export default React.memo(CarouselAppGrid);
