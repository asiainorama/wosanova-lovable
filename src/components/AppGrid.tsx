
import React, { useEffect, useState, useRef } from 'react';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import { ScrollArea } from './ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();
  const [pages, setPages] = useState<AppData[][]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate grid dimensions based on screen size
  const getGridDimensions = () => {
    // Get browser width and determine if portrait or landscape
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    
    // Based on specifications:
    // Móvil vertical: 4 columnas × 6 filas = 24 elementos
    // Móvil horizontal: 5 columnas × 2 filas = 10 elementos
    // Tablet vertical: 5 columnas × 6 filas = 30 elementos
    // Tablet horizontal: 6 columnas × 4 filas = 24 elementos
    // Pantallas grandes: 8 columnas × 6 filas = 48 elementos
    
    if (width < 640) { // Mobile
      return isPortrait ? { cols: 4, rows: 6 } : { cols: 5, rows: 2 };
    } else if (width < 1024) { // Tablet
      return isPortrait ? { cols: 5, rows: 6 } : { cols: 6, rows: 4 };
    } else { // Large screen
      return { cols: 8, rows: 6 };
    }
  };

  useEffect(() => {
    // Split apps into pages based on grid dimensions
    const { cols, rows } = getGridDimensions();
    const itemsPerPage = cols * rows;
    
    const paginatedApps: AppData[][] = [];
    for (let i = 0; i < apps.length; i += itemsPerPage) {
      paginatedApps.push(apps.slice(i, i + itemsPerPage));
    }
    
    setPages(paginatedApps.length > 0 ? paginatedApps : [[]]);
    setCurrentPage(0); // Reset to first page when grid layout changes
    
    // Add resize listener to recalculate grid dimensions
    const handleResize = () => {
      const { cols, rows } = getGridDimensions();
      const itemsPerPage = cols * rows;
      
      const paginatedApps: AppData[][] = [];
      for (let i = 0; i < apps.length; i += itemsPerPage) {
        paginatedApps.push(apps.slice(i, i + itemsPerPage));
      }
      
      setPages(paginatedApps.length > 0 ? paginatedApps : [[]]);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [apps]);
  
  // Handle scroll snap to page
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const pageWidth = scrollWidth / pages.length;
        const newPage = Math.round(scrollLeft / pageWidth);
        
        if (newPage !== currentPage) {
          setCurrentPage(newPage);
        }
      }
    };
    
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, pages.length]);
  
  // Handle page change from dot indicator
  const goToPage = (pageIndex: number) => {
    if (scrollContainerRef.current && pageIndex >= 0 && pageIndex < pages.length) {
      const pageWidth = scrollContainerRef.current.scrollWidth / pages.length;
      scrollContainerRef.current.scrollTo({
        left: pageIndex * pageWidth,
        behavior: 'smooth'
      });
      setCurrentPage(pageIndex);
    }
  };

  if (apps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
      </div>
    );
  }

  // Calculate grid columns based on screen size and orientation
  const { cols, rows } = getGridDimensions();
  
  return (
    <div className="flex flex-col w-full">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex w-full">
          {pages.map((pageApps, pageIndex) => (
            <div 
              key={pageIndex} 
              className="flex-shrink-0 w-full snap-center"
            >
              <div 
                className={cn(
                  "grid gap-3 px-1 py-2",
                  `grid-cols-${cols} grid-rows-${rows}`
                )}
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, auto)`
                }}
              >
                {pageApps.map((app) => (
                  <AppCard 
                    key={app.id} 
                    app={app} 
                    showRemove={showRemove}
                    showManage={showManage}
                    onShowDetails={onShowDetails}
                    isLarge={isLarge}
                    smallerIcons={smallerIcons || isMobile}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dot indicators for pagination */}
      {pages.length > 1 && (
        <div className="flex justify-center mt-2 gap-1">
          {pages.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                currentPage === index 
                  ? 'w-4 bg-primary' 
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
              onClick={() => goToPage(index)}
              aria-label={`Ir a la página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppGrid;
