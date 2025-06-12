
import React, { useState, useEffect, useCallback } from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import useEmblaCarousel from 'embla-carousel-react';
import { useIsMobile } from '@/hooks/use-mobile';
import PaginationIndicator from './PaginationIndicator';
import SwiperCarousel from './SwiperCarousel';
import { calculateOptimalGrid } from '@/utils/gridCalculator';

interface AppGridProps {
  apps: AppData[];
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  compact?: boolean;
  moreCompact?: boolean;
  smallerIcons?: boolean;
  useCarousel?: boolean;
  carouselKey?: string;
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
  useCarousel = false,
  carouselKey = ''
}) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(0);
  
  // Use the optimized grid calculator
  const getGridConfig = useCallback(() => {
    return calculateOptimalGrid(smallerIcons);
  }, [smallerIcons]);

  const [gridConfig, setGridConfig] = useState(getGridConfig());
  
  // Debug log to see what configuration we're getting
  useEffect(() => {
    const config = getGridConfig();
    console.log("Grid config:", config, "Screen size:", window.innerWidth, "x", window.innerHeight, "Landscape:", window.innerWidth > window.innerHeight);
    setGridConfig(config);
  }, [getGridConfig]);
  
  // Recalculate grid on window resize
  useEffect(() => {
    const handleResize = () => {
      const newConfig = getGridConfig();
      setGridConfig(newConfig);
      console.log("Grid config updated:", newConfig, "Screen size:", window.innerWidth, "x", window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getGridConfig]);
  
  const appsPerPage = gridConfig.cols * gridConfig.rows;
  const totalPages = Math.ceil(apps.length / appsPerPage);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'start',
    dragFree: false
  });
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentPage(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Function to get apps for a specific page
  const getAppsForPage = (pageIndex: number) => {
    const startIndex = pageIndex * appsPerPage;
    return apps.slice(startIndex, startIndex + appsPerPage);
  };
  
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  // If not using carousel, fall back to the original grid implementation
  if (!useCarousel) {
    return (
      <div className={
        isLarge 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
          : moreCompact
            ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-4" 
            : compact
              ? "grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9 gap-4" 
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
      }>
        {apps.map((app, index) => (
          <AppCard 
            key={app.id} 
            app={app} 
            showRemove={showRemove}
            showManage={showManage}
            onShowDetails={onShowDetails}
            isLarge={isLarge}
            smallerIcons={smallerIcons}
            index={index}
          />
        ))}
      </div>
    );
  }
  
  // Use the optimized Swiper implementation
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

export default React.memo(AppGrid);
