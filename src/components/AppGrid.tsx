
import React, { useState, useEffect, useMemo } from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from './ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
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
}

const AppGrid: React.FC<AppGridProps> = ({ 
  apps, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  compact = false,
  moreCompact = false,
  smallerIcons = false
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update orientation and window width on resize
  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine grid configuration based on screen size and orientation
  const gridConfig = useMemo(() => {
    // Mobile
    if (windowWidth < 640) {
      return orientation === 'portrait'
        ? { cols: 4, rows: 6, itemsPerPage: 24 } // Mobile portrait: 4x6
        : { cols: 5, rows: 2, itemsPerPage: 10 }; // Mobile landscape: 5x2
    }
    // Tablet
    else if (windowWidth < 1024) {
      return orientation === 'portrait'
        ? { cols: 5, rows: 6, itemsPerPage: 30 } // Tablet portrait: 5x6
        : { cols: 6, rows: 4, itemsPerPage: 24 }; // Tablet landscape: 6x4
    }
    // Desktop
    else {
      return { cols: 8, rows: 6, itemsPerPage: 48 }; // Large screens: 8x6
    }
  }, [windowWidth, orientation]);

  // If no apps, show empty state
  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  // Calculate total pages
  const totalPages = Math.ceil(apps.length / gridConfig.itemsPerPage);
  
  // Get apps for current page
  const startIndex = currentPage * gridConfig.itemsPerPage;
  const endIndex = Math.min(startIndex + gridConfig.itemsPerPage, apps.length);
  const currentApps = apps.slice(startIndex, endIndex);

  // Grid style based on configuration
  const gridStyle = `grid-cols-${gridConfig.cols} grid-rows-${gridConfig.rows}`;
  
  // Calculate icon size based on screen width
  const getIconSizeClass = () => {
    if (windowWidth < 640) return "scale-75"; // Smaller for mobile
    else if (windowWidth < 1024) return "scale-90"; // Medium for tablet
    else return "scale-110"; // Larger for desktop
  };

  return (
    <div className="w-full">
      <Carousel className="w-full" onSelect={(index) => setCurrentPage(index)}>
        <CarouselContent>
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const pageStartIndex = pageIndex * gridConfig.itemsPerPage;
            const pageEndIndex = Math.min(pageStartIndex + gridConfig.itemsPerPage, apps.length);
            const pageApps = apps.slice(pageStartIndex, pageEndIndex);
            
            return (
              <CarouselItem key={pageIndex} className="w-full">
                <div className={`grid grid-cols-${gridConfig.cols} gap-3 md:gap-4 ${getIconSizeClass()}`}>
                  {pageApps.map((app) => (
                    <AppCard 
                      key={app.id} 
                      app={app} 
                      showRemove={showRemove}
                      showManage={showManage}
                      onShowDetails={onShowDetails}
                      isLarge={isLarge}
                      smallerIcons={windowWidth < 640}
                    />
                  ))}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      
      <PaginationIndicator 
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AppGrid;
