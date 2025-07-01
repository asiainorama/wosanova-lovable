
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { AppData } from '@/data/apps';
import useCarouselController from '@/hooks/useCarouselController';
import useCarouselLayoutEffects from '@/hooks/useCarouselLayoutEffects';
import { useSwiperSetup } from '@/hooks/useSwiperSetup';
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
  
  // Setup swiper configuration and pagination
  const { paginatedApps, totalPages, swiperConfig } = useSwiperSetup({
    apps,
    gridConfig
  });

  return (
    <div className="relative h-full w-full will-change-transform grid-container" key={`carousel-container-${resetKey}`}>
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        initialSlide={currentPage}
        onSlideChange={handleSlideChange}
        {...swiperConfig}
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
