
import { useState, useEffect, useCallback } from 'react';
import { calculateOptimalGrid } from '@/utils/gridCalculator';

export const useGridConfiguration = (smallerIcons: boolean) => {
  const getGridConfig = useCallback(() => {
    return calculateOptimalGrid(smallerIcons);
  }, [smallerIcons]);

  const [gridConfig, setGridConfig] = useState(getGridConfig());

  useEffect(() => {
    const config = getGridConfig();
    console.log("Grid config from hook:", config, "Screen size:", window.innerWidth, "x", window.innerHeight);
    setGridConfig(config);
  }, [getGridConfig]);

  useEffect(() => {
    const handleResize = () => {
      const newConfig = getGridConfig();
      setGridConfig(newConfig);
      console.log("Grid config updated from hook:", newConfig, "Screen size:", window.innerWidth, "x", window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getGridConfig]);

  return gridConfig;
};
