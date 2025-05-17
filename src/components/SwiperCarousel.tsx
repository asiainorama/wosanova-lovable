
import React, { useRef, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Virtual } from 'swiper/modules';
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
  
  // Calculate how many apps per page
  const appsPerPage = gridConfig.cols * gridConfig.rows;
  
  // Calculate total pages
  const totalPages = Math.ceil(apps.length / appsPerPage);

  // Function to get apps for a specific page
  const getAppsForPage = (pageIndex: number) => {
    const startIndex = pageIndex * appsPerPage;
    return apps.slice(startIndex, startIndex + appsPerPage);
  };
  
  // All pages data - memoized to prevent recalculation
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }).map((_, i) => getAppsForPage(i));
  }, [apps, appsPerPage, totalPages]);

  // Determine grid gap based on device type
  const getGridGap = () => {
    if (window.innerWidth < 768) {
      return 'gap-2'; // Small gap for mobile
    } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      return 'gap-3'; // Medium gap for tablets
    } else {
      return 'gap-4'; // Larger gap for desktop
    }
  };

  // Handle slide change
  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentPage(swiper.activeIndex);
  };

  // Synchronize with external pagination
  const handleExternalPagination = (pageIndex: number) => {
    if (swiperRef.current && pageIndex !== currentPage) {
      swiperRef.current.slideTo(pageIndex);
      setCurrentPage(pageIndex);
    }
  };

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
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative h-full will-change-transform">
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        initialSlide={currentPage}
        onSlideChange={handleSlideChange}
        modules={[Navigation, Pagination, Virtual]}
        speed={300}
        cssMode={true}
        resistanceRatio={0.85}
        threshold={20}
        followFinger={true}
        touchRatio={1}
        virtual={{
          addSlidesAfter: 1,
          addSlidesBefore: 1,
        }}
        className="h-full app-swiper"
        wrapperClass="h-full"
      >
        {pages.map((pageApps, pageIndex) => (
          <SwiperSlide key={`page-${pageIndex}`} className="h-full" virtualIndex={pageIndex}>
            <div className="h-full p-2 flex items-center will-change-transform">
              <div
                className={`w-full h-full grid ${getGridGap()} mx-auto my-auto`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
                  justifyContent: 'space-between',
                  alignContent: 'space-between',
                }}
              >
                {pageApps.map((app, index) => (
                  <div key={`${pageIndex}-${app.id}`} className="flex items-center justify-center">
                    <AppCard 
                      app={app} 
                      showRemove={showRemove}
                      showManage={showManage}
                      onShowDetails={onShowDetails}
                      isLarge={false}
                      smallerIcons={smallerIcons}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {totalPages > 1 && (
        <PaginationIndicator
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handleExternalPagination}
        />
      )}
    </div>
  );
};

export default React.memo(SwiperCarousel);
