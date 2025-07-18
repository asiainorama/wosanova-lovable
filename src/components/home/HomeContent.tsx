
import React from 'react';
import AppGrid from '@/components/AppGrid';
import AppLogoLoader from '@/components/loading/AppLogoLoader';
import HomeLoadingAnimation from '@/components/loading/HomeLoadingAnimation';
import EmptyHomeState from './EmptyHomeState';
import { AppData } from '@/data/types';

interface HomeContentProps {
  sortedFavorites: AppData[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

const HomeContent: React.FC<HomeContentProps> = ({ sortedFavorites, isLoading, isAuthenticated }) => {
  // Show loading state initially to prevent flash
  if (isLoading) {
    return <AppLogoLoader />;
  }

  // Show loading animation while favorites are being loaded for authenticated users
  if (isAuthenticated && sortedFavorites.length === 0) {
    return <HomeLoadingAnimation apps={[]} />;
  }

  // For unauthenticated users with no favorites, show empty state
  if (!isAuthenticated && sortedFavorites.length === 0) {
    return <EmptyHomeState />;
  }

  return (
    <div className="flex-grow flex flex-col h-full opacity-0 animate-fade-in" style={{ animationDuration: '150ms', animationFillMode: 'forwards' }}>
      <AppGrid 
        apps={sortedFavorites}
        useCarousel={true}
        smallerIcons={true}
        carouselKey="home"
      />
    </div>
  );
};

export default HomeContent;
