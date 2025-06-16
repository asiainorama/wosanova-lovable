
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppData } from '@/data/types';

interface HomeLoadingAnimationProps {
  apps: AppData[];
}

const HomeLoadingAnimation: React.FC<HomeLoadingAnimationProps> = ({ apps }) => {
  // Create placeholder items based on apps length or default to 12
  const placeholderCount = apps.length > 0 ? Math.min(apps.length, 12) : 12;
  const placeholders = Array.from({ length: placeholderCount }, (_, index) => index);

  return (
    <div className="flex-grow flex flex-col h-full opacity-0 animate-fade-in" 
         style={{ animationDuration: '300ms', animationFillMode: 'forwards' }}>
      <div className="h-full w-full px-1 flex items-center justify-center">
        <div
          className="w-full grid-container-evenly"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            alignContent: 'space-evenly',
            justifyContent: 'space-evenly',
            padding: '1% 2%',
            width: '100%',
            height: 'calc(100vh - 180px)',
            margin: '0 auto',
            maxWidth: 'min(100%, 1200px)',
            gap: '8px'
          }}
        >
          {placeholders.map((index) => (
            <div 
              key={`loading-${index}`}
              className="flex flex-col items-center gap-1 p-1 h-full justify-between opacity-0 animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'forwards',
                animationDuration: '200ms'
              }}
            >
              {/* Icon skeleton */}
              <div className="relative flex-shrink-0">
                <Skeleton className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full animate-pulse" />
              </div>
              
              {/* Name skeleton */}
              <div className="w-full flex justify-center mt-1">
                <Skeleton className="h-3 md:h-4 rounded animate-pulse" 
                         style={{ width: `${Math.random() * 40 + 60}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Loading dots indicator */}
      <div className="flex justify-center items-center py-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" 
               style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" 
               style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" 
               style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoadingAnimation;
