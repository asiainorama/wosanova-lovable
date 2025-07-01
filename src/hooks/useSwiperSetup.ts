import { useMemo } from 'react';
import { AppData } from '@/data/apps';
import { preparePaginatedApps } from '@/utils/gridCalculator';
import { SwiperConfigService } from '@/services/SwiperConfigService';

interface UseSwiperSetupProps {
  apps: AppData[];
  gridConfig: { cols: number; rows: number };
}

export const useSwiperSetup = ({ apps, gridConfig }: UseSwiperSetupProps) => {
  // Calculate pagination data
  const appsPerPage = gridConfig.cols * gridConfig.rows;
  const totalPages = Math.ceil(apps.length / appsPerPage);

  // Create paginated apps with precise ordering algorithm
  const paginatedApps = useMemo(() => {
    return preparePaginatedApps(apps, appsPerPage, totalPages);
  }, [apps, appsPerPage, totalPages]);

  // Get swiper configuration
  const swiperConfig = SwiperConfigService.getDefaultConfig();

  return {
    paginatedApps,
    totalPages,
    swiperConfig
  };
};