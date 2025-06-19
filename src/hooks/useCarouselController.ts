
import { useRef, useState, useCallback } from 'react';
import { type Swiper as SwiperType } from 'swiper';
import useCarouselState from './useCarouselState';

/**
 * Hook to control carousel behavior and state
 */
export function useCarouselController(carouselKey: string = '') {
  const swiperRef = useRef<SwiperType | null>(null);
  const { currentPage, setCurrentPage, goToPage } = useCarouselState(0, carouselKey);
  const [resetKey, setResetKey] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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

  return {
    swiperRef,
    currentPage,
    resetKey,
    isTransitioning, 
    handleSlideChange,
    handleExternalPagination,
    forceCarouselReset,
    setupScrollBehavior,
    lockScrollBehavior,
    detectAppReturn,
    saveGridState
  };
}

export default useCarouselController;
