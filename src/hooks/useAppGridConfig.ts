
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculateOptimalGrid } from '@/utils/gridCalculator';

export const useAppGridConfig = (smallerIcons: boolean = false) => {
  const isMobile = useIsMobile();
  
  // Use the optimized grid calculator
  const getGridConfig = useCallback(() => {
    return calculateOptimalGrid(smallerIcons);
  }, [smallerIcons]);

  const [gridConfig, setGridConfig] = useState(getGridConfig());
  
  // Debug log to see what configuration we're getting
  useEffect(() => {
    const config = getGridConfig();
    console.log("Grid config:", config, "Screen size:", window.innerWidth, "x", window.innerHeight, "Landscape:", window.innerWidth > window.innerHeight);
    setGridConfig(config);
  }, [getGridConfig]);
  
  // Recalculate grid on window resize
  useEffect(() => {
    const handleResize = () => {
      const newConfig = getGridConfig();
      setGridConfig(newConfig);
      console.log("Grid config updated:", newConfig, "Screen size:", window.innerWidth, "x", window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getGridConfig]);

  return { gridConfig, isMobile };
};
