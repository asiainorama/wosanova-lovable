
import { useState, useEffect, useRef } from 'react';

// Storage key for persisting carousel state
const CAROUSEL_STATE_KEY = 'app_carousel_state';

interface CarouselState {
  currentPage: number;
}

/**
 * Custom hook to maintain persistence of carousel state
 */
const useCarouselState = (initialPage = 0) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const isInitialized = useRef(false);
  
  // Load saved state on first render
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedState = localStorage.getItem(CAROUSEL_STATE_KEY);
        if (savedState) {
          const parsedState: CarouselState = JSON.parse(savedState);
          setCurrentPage(parsedState.currentPage);
        }
      } catch (error) {
        console.error('Error loading carousel state:', error);
      }
      isInitialized.current = true;
    }
  }, []);
  
  // Save state when it changes
  useEffect(() => {
    if (isInitialized.current) {
      try {
        const stateToSave: CarouselState = { currentPage };
        localStorage.setItem(CAROUSEL_STATE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Error saving carousel state:', error);
      }
    }
  }, [currentPage]);
  
  return {
    currentPage,
    setCurrentPage,
  };
};

export default useCarouselState;
