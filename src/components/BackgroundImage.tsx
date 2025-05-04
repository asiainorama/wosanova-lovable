
import React from 'react';
import { useBackground } from '@/contexts/BackgroundContext';

export const BackgroundImage: React.FC = () => {
  const { backgroundUrl } = useBackground();
  
  if (!backgroundUrl) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${backgroundUrl})`,
        backgroundAttachment: 'fixed' 
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
    </div>
  );
};
