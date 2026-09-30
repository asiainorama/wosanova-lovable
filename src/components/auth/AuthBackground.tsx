import React from 'react';
import { BackgroundType } from '@/contexts/BackgroundContext';
import { backgroundStyles } from '@/constants/wallpapers';

interface AuthBackgroundProps {
  background: BackgroundType;
  children: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ background, children }) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        ...(backgroundStyles[background] ?? backgroundStyles.default),
        minHeight: '100vh',
        minWidth: '100vw',
        height: window.innerHeight ? `${window.innerHeight}px` : '100vh',
      }}
    >
      {children}
    </div>
  );
};
