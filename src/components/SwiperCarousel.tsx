
import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Virtual, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { AppData } from '@/data/apps';
import { preparePaginatedApps } from '@/utils/gridCalculator';
import useCarouselController from '@/hooks/useCarouselController';
import useCarouselLayoutEffects from '@/hooks/useCarouselLayoutEffects';
import CarouselGridPage from './carousel/CarouselGridPage';
import CarouselPagination from './carousel/CarouselPagination';

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
  // Use custom hooks to manage state and behavior
  const {
    swiperRef,
    currentPage,
    resetKey,
    isTransitioning,
    handleSlideChange,
    handleExternalPagination,
    setupScrollBehavior,
    lockScrollBehavior,
    detectAppReturn,
    saveGridState
  } = useCarouselController(carouselKey);
  
  // Apply layout effects
  useCarouselLayoutEffects(
    swiperRef,
    currentPage,
    isTransitioning,
    detectAppReturn,
    setupScrollBehavior,
    saveGridState
  );
  
  // Calculate how many apps per page
  const appsPerPage = gridConfig.cols * gridConfig.rows;
  
  // Calculate total pages
  const totalPages = Math.ceil(apps.length / appsPerPage);

  // Create paginated apps with precise ordering algorithm
  const paginatedApps = useMemo(() => {
    return preparePaginatedApps(apps, appsPerPage, totalPages);
  }, [apps, appsPerPage, totalPages]);

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
            <CarouselGridPage
              pageApps={pageApps}
              pageIndex={pageIndex}
              gridConfig={gridConfig}
              showRemove={showRemove}
              showManage={showManage}
              onShowDetails={onShowDetails}
              smallerIcons={smallerIcons}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <CarouselPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handleExternalPagination}
      />
    </div>
  );
};

export default React.memo(SwiperCarousel);
