import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Virtual, Mousewheel } from 'swiper/modules';
import { type Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { AppData } from '@/data/apps';
import AppCard from './AppCard';
import useCarouselState from '@/hooks/useCarouselState';
import PaginationIndicator from './PaginationIndicator';

// Add some CSS for Swiper
import '../styles/swiper-custom.css';

interface SwiperCarouselProps {
  apps: AppData[];
  gridConfig: { cols: number; rows: number };
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
  carouselKey?: string;
}

const SwiperCarousel: React.FC<SwiperCarouselProps> = ({
  apps,
  gridConfig,
  showRemove = false,
  showManage = false,
  onShowDetails,
  smallerIcons = false,
  carouselKey = ''
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const { currentPage, setCurrentPage, goToPage } = useCarouselState(0, carouselKey);
  const [resetKey, setResetKey] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Calculate how many apps per page
  const appsPerPage = gridConfig.cols * gridConfig.rows;
  
  // Calculate total pages
  const totalPages = Math.ceil(apps.length / appsPerPage);

  // Create paginated apps with precise ordering algorithm
  const paginatedApps = useMemo(() => {
    return Array(totalPages).fill(null).map((_, pageIndex) => {
      const startIdx = pageIndex * appsPerPage;
      const pageItems = apps.slice(startIdx, startIdx + appsPerPage);
      
      // Fill with empty items to maintain structure
      if (pageItems.length < appsPerPage && pageIndex === totalPages - 1) {
        return [...pageItems, ...Array(appsPerPage - pageItems.length).fill(null)];
      }
      return pageItems;
    });
  }, [apps, appsPerPage, totalPages]);
  
  // Handle slide change
  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentPage(swiper.activeIndex);
    setIsTransitioning(true);
    
    // Ensure transition completes
    setTimeout(() => setIsTransitioning(false), 350);
  };

  // Synchronize with external pagination
  const handleExternalPagination = (pageIndex: number) => {
    if (swiperRef.current && pageIndex !== currentPage) {
      swiperRef.current.slideTo(pageIndex);
      setCurrentPage(pageIndex);
    }
  };

  // Force carousel reset when needed
  const forceCarouselReset = useCallback(() => {
    // Save temp state
    const currentPageBackup = currentPage;
    
    // Force component remount
    setResetKey(prev => prev + 1);
    
    // Restore after remount
    setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.slideTo(currentPageBackup, 0);
      }
    }, 50);
  }, [currentPage]);

  // Setup scroll behavior and restore state
  const setupScrollBehavior = useCallback(() => {
    // Force horizontal scroll mode
    document.body.style.overflowY = 'hidden';
    document.body.style.overflowX = 'auto';
    
    // Restore carousel position
    if (swiperRef.current && swiperRef.current.activeIndex !== currentPage) {
      swiperRef.current.slideTo(currentPage, 0);
      console.log(`Restored carousel to page ${currentPage}`);
    }
  }, [currentPage]);

  // Lock scroll behavior to prevent layout changes
  const lockScrollBehavior = useCallback(() => {
    const scrollHandler = () => {
      if (document.body.style.overflowY !== 'hidden') {
        document.body.style.overflowY = 'hidden';
        document.body.style.overflowX = 'auto';
      }
    };
    
    // Check frequently for a short period
    const intervalId = setInterval(scrollHandler, 100);
    setTimeout(() => clearInterval(intervalId), 2000);
  }, []);

  // Detect app return with triple redundancy
  const detectAppReturn = useCallback(() => {
    console.log('App return detected');
    setupScrollBehavior();
    lockScrollBehavior();
    
    // If layout seems to be broken, reset the carousel
    if (swiperRef.current && swiperRef.current.activeIndex !== currentPage) {
      forceCarouselReset();
    }
  }, [setupScrollBehavior, lockScrollBehavior, forceCarouselReset, currentPage]);

  // Save the current state
  const saveGridState = useCallback(() => {
    const stateToSave = { currentPage };
    localStorage.setItem('appGridState', JSON.stringify(stateToSave));
    sessionStorage.setItem('appGridState', JSON.stringify(stateToSave));
    console.log(`Saved grid state: page ${currentPage}`);
  }, [currentPage]);

  // Force transition completion for iPad horizontal mode
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        if (swiperRef.current) {
          swiperRef.current.slideTo(currentPage, 300, true);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentPage]);

  // Initialize the swiper with the saved page
  useEffect(() => {
    if (swiperRef.current && currentPage !== swiperRef.current.activeIndex) {
      // Timeout to ensure swiper is fully initialized
      const timer = setTimeout(() => {
        if (swiperRef.current) {
          swiperRef.current.slideTo(currentPage, 0);
          console.log(`Initialized carousel to page ${currentPage}`);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  // Handle window resize to ensure proper layout
  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current) {
        swiperRef.current.update();
        setTimeout(() => {
          if (swiperRef.current) {
            swiperRef.current.slideTo(currentPage, 0, false);
          }
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentPage]);

  // Persistent state and app return detection
  useEffect(() => {
    // Initial setup
    setupScrollBehavior();
    
    // Event listeners for app return
    window.addEventListener('focus', detectAppReturn);
    window.addEventListener('pageshow', detectAppReturn);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') detectAppReturn();
    });
    
    // iOS Safari specific
    window.addEventListener('pagehide', saveGridState);
    
    return () => {
      window.removeEventListener('focus', detectAppReturn);
      window.removeEventListener('pageshow', detectAppReturn);
      document.removeEventListener('visibilitychange', detectAppReturn);
      window.removeEventListener('pagehide', saveGridState);
    };
  }, [detectAppReturn, setupScrollBehavior, saveGridState]);

  // Save state when current page changes
  useEffect(() => {
    saveGridState();
  }, [currentPage, saveGridState]);

  // Calculate dynamic cell height for proper spacing
  const calculateMinCellHeight = () => {
    const viewportHeight = window.innerHeight;
    const headerHeight = 100; // Approximate header height
    const footerHeight = 60; // Increased footer height to account for pagination dots
    return `calc((${viewportHeight}px - ${headerHeight + footerHeight}px) / ${gridConfig.rows})`;
  };

  return (
    <div className="relative h-full w-full will-change-transform grid-container" key={`carousel-container-${resetKey}`}>
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        initialSlide={currentPage}
        onSlideChange={handleSlideChange}
        modules={[Navigation, Pagination, Virtual, Mousewheel]}
        mousewheel={{
          forceToAxis: true,
          sensitivity: 1.2,
          thresholdDelta: 50,
          thresholdTime: 150,
        }}
        speed={300}
        cssMode={false}
        resistanceRatio={0.85}
        threshold={20}
        followFinger={true}
        touchRatio={1}
        watchSlidesProgress={true}
        grabCursor={true}
        virtual={{
          addSlidesAfter: 1,
          addSlidesBefore: 1,
        }}
        className="h-full app-swiper"
        wrapperClass="h-full"
      >
        {paginatedApps.map((pageApps, pageIndex) => (
          <SwiperSlide key={`page-${pageIndex}`} className="h-full" virtualIndex={pageIndex}>
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
                  <div 
                    key={`${pageIndex}-${app ? app.id : `empty-${index}`}`} 
                    className="app-grid-item"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      height: '100%',
                      minHeight: calculateMinCellHeight()
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
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {totalPages > 1 && (
        <div className="pagination-container">
          <PaginationIndicator
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handleExternalPagination}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(SwiperCarousel);
