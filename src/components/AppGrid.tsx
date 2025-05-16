import React, { useState, useEffect, useCallback } from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import { type EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
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

// Define device types
type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Define device breakpoints
const MOBILE_BREAKPOINT = 768; // Mobile: up to 767px
const TABLET_BREAKPOINT = 1024; // Tablet: 768px to 1023px

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
  
  // Define grid sizes based on screen size and orientation
  const getGridConfig = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    
    // Mobile (up to 767px)
    if (width < MOBILE_BREAKPOINT) {
      return isLandscape 
        ? { cols: 5, rows: 2 } // mobile landscape
        : { cols: 4, rows: 6 }; // mobile portrait
    }
    
    // Tablet (768px to 1023px)
    if (width < TABLET_BREAKPOINT) {
      return isLandscape
        ? { cols: 6, rows: 4 } // tablet landscape
        : { cols: 5, rows: 6 }; // tablet portrait
    }
    
    // Large screens (1024px or more)
    return { cols: 8, rows: 6 };
  }, []);

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
  
  // Get device type for icon sizing
  const getDeviceType = (): DeviceType => {
    const width = window.innerWidth;
    if (width < MOBILE_BREAKPOINT) return 'mobile';
    if (width < TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  };
  
  // Ensure deviceType is set properly as a DeviceType value
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType());
  
  // Update device type when window resizes
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
        {apps.map((app) => (
          <AppCard 
            key={app.id} 
            app={app} 
            showRemove={showRemove}
            showManage={showManage}
            onShowDetails={onShowDetails}
            isLarge={isLarge}
            smallerIcons={smallerIcons}
            deviceType={deviceType}
          />
        ))}
      </div>
    );
  }
  
  // Carousel implementation
  return (
    <div className="relative">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={`page-${pageIndex}`} className="flex-[0_0_100%] min-w-0 h-full">
              <div className="p-2 h-full flex items-center justify-center">
                <div 
                  className="grid h-full w-full" 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
                    gap: deviceType === 'mobile' ? '0.5rem' : deviceType === 'tablet' ? '0.75rem' : '1rem',
                    justifyContent: 'space-between',
                    alignContent: 'space-between'
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
                        deviceType={deviceType}
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
