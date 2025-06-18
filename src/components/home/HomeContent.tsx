
import React from 'react';
import AppGrid from '@/components/AppGrid';
import AppLogoLoader from '@/components/loading/AppLogoLoader';
import EmptyHomeState from './EmptyHomeState';
import { AppData } from '@/data/types';

interface HomeContentProps {
  sortedFavorites: AppData[];
  isLoading: boolean;
}

const HomeContent: React.FC<HomeContentProps> = ({ sortedFavorites, isLoading }) => {
  // Show loading state initially to prevent flash
  if (isLoading) {
    return <AppLogoLoader />;
  }

  if (sortedFavorites.length > 0) {
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
  }

  return <EmptyHomeState />;
};

export default HomeContent;
