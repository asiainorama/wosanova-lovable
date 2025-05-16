
import React, { useState, useEffect, useCallback } from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import { useIsMobile } from '@/hooks/use-mobile';
import PaginationIndicator from './PaginationIndicator';

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
  useCarousel = false
}) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(0);
  
  // Define grid sizes based on screen size
  const getGridConfig = useCallback(() => {
    // Check if we're on mobile and its orientation
    if (isMobile) {
      return window.innerWidth > window.innerHeight 
        ? { cols: 5, rows: 2 } // mobile landscape
        : { cols: 4, rows: 6 }; // mobile portrait
    }
    
    // For tablets
    if (window.innerWidth <= 1024) {
      return window.innerWidth > window.innerHeight
        ? { cols: 6, rows: 4 } // tablet landscape
        : { cols: 5, rows: 6 }; // tablet portrait
    }
    
    // Large screens
    return { cols: 8, rows: 6 };
  }, [isMobile]);

  const [gridConfig, setGridConfig] = useState(getGridConfig());
  
  // Recalculate grid on window resize
  useEffect(() => {
    const handleResize = () => {
      setGridConfig(getGridConfig());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Get grid style classes based on configuration
  const getGridClasses = () => {
    return `grid grid-cols-${gridConfig.cols} gap-2 h-full`;
  };
  
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
        {apps.map((app) => (
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
  }
  
  // Carousel implementation
  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={`page-${pageIndex}`} className="flex-[0_0_100%] min-w-0">
              <div className="p-2">
                <div 
                  className={getGridClasses()}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`
                  }}
                >
                  {getAppsForPage(pageIndex).map((app, index) => (
                    <div key={`${pageIndex}-${app.id}`} className="flex items-center justify-center">
                      <AppCard 
                        app={app} 
                        showRemove={showRemove}
                        showManage={showManage}
                        onShowDetails={onShowDetails}
                        isLarge={false}
                        smallerIcons={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {totalPages > 1 && (
        <PaginationIndicator 
          totalPages={totalPages} 
          currentPage={currentPage}
          onPageChange={(index) => {
            if (emblaApi) emblaApi.scrollTo(index);
          }}
        />
      )}
    </div>
  );
};

export default AppGrid;
