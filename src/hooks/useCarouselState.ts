
import { useState, useEffect, useRef, useCallback } from 'react';

// Storage key for persisting carousel state
const CAROUSEL_STATE_KEY = 'app_carousel_state';

interface CarouselState {
  currentPage: number;
  lastVisited: number; // Timestamp of last visit
}

/**
 * Custom hook to maintain persistence of carousel state
 * @param initialPage - Default page to show if no saved state exists
 * @param key - Optional custom storage key suffix for multiple carousels
 * @returns Object with currentPage and methods to control the carousel
 */
const useCarouselState = (initialPage = 0, key = '') => {
  // Generate a unique storage key if one is provided
  const storageKey = key ? `${CAROUSEL_STATE_KEY}_${key}` : CAROUSEL_STATE_KEY;
  
  // State for tracking the current page
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  
  // Reference to track initialization status
  const isInitialized = useRef<boolean>(false);
  
  // Reference to track if the component is mounted
  const isMounted = useRef<boolean>(true);

  // Load saved state on first render
  useEffect(() => {
    // Set up cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        // Try to get state from sessionStorage first (for current session)
        let savedState = sessionStorage.getItem(storageKey);
        
        // If not found in session, try localStorage (for persistent state)
        if (!savedState) {
          savedState = localStorage.getItem(storageKey);
        }
        
        if (savedState) {
          const parsedState: CarouselState = JSON.parse(savedState);
          // Only use saved state if it exists and we're mounted
          if (isMounted.current) {
            setCurrentPage(parsedState.currentPage);
            console.log(`Restored carousel to page ${parsedState.currentPage}`);
          }
        }
      } catch (error) {
        console.error('Error loading carousel state:', error);
      }
      isInitialized.current = true;
    }
  }, [storageKey]);
  
  // Save state when it changes
  useEffect(() => {
    if (isInitialized.current && isMounted.current) {
      try {
        const stateToSave: CarouselState = { 
          currentPage,
          lastVisited: Date.now()
        };
        
        // Save to both storage mechanisms for redundancy
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Error saving carousel state:', error);
      }
    }
  }, [currentPage, storageKey]);
  
  // Method to set the page with bounds checking
  const goToPage = useCallback((pageIndex: number, totalPages?: number) => {
    if (pageIndex >= 0 && (totalPages === undefined || pageIndex < totalPages)) {
      setCurrentPage(pageIndex);
    }
  }, []);
  
  // Method to go to the next page
  const nextPage = useCallback((totalPages?: number) => {
    setCurrentPage(prevPage => {
      const nextPageIndex = prevPage + 1;
      // Only increment if we don't exceed bounds
      if (totalPages === undefined || nextPageIndex < totalPages) {
        return nextPageIndex;
      }
      return prevPage;
    });
  }, []);
  
  // Method to go to the previous page
  const prevPage = useCallback(() => {
    setCurrentPage(prevPage => {
      const prevPageIndex = prevPage - 1;
      // Only decrement if we don't go below 0
      if (prevPageIndex >= 0) {
        return prevPageIndex;
      }
      return prevPage;
    });
  }, []);
  
  // Reset method to set page to 0
  const resetPage = useCallback(() => {
    setCurrentPage(0);
  }, []);
  
  return {
    currentPage,
    setCurrentPage,
    goToPage,
    nextPage,
    prevPage,
    resetPage
  };
};

export default useCarouselState;
