
import { useEffect } from 'react';
import { type Swiper as SwiperType } from 'swiper';

/**
 * Hook to handle all layout effects related to the carousel
 */
export function useCarouselLayoutEffects(
  swiperRef: React.MutableRefObject<SwiperType | null>,
  currentPage: number,
  isTransitioning: boolean,
  detectAppReturn: () => void,
  setupScrollBehavior: () => void,
  saveGridState: () => void
) {
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
  }, [isTransitioning, currentPage, swiperRef]);

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
  }, [currentPage, swiperRef]);

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
  }, [currentPage, swiperRef]);

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
}

export default useCarouselLayoutEffects;
