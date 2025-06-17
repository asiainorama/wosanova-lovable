
import React, { useEffect } from 'react';
import { BackgroundType } from '@/contexts/BackgroundContext';

interface AuthBackgroundProps {
  background: BackgroundType;
  children: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ background, children }) => {
  // Add gradient animation styles to document
  useEffect(() => {
    if (!document.getElementById('gradient-animations')) {
      const style = document.createElement('style');
      style.id = 'gradient-animations';
      style.textContent = `
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 100% 50%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Get background styles
  const getBackgroundStyle = (): React.CSSProperties => {
    const backgroundStyles: Record<BackgroundType, React.CSSProperties> = {
      default: {
        backgroundImage: 'url(/lovable-uploads/6a5b9b5f-b488-4e38-9dc2-fc56fc85bfd9.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      },
      'gradient-blue': {
        background: 'linear-gradient(135deg, #667eea, #764ba2, #5a67d8, #667eea)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 12s ease infinite'
      },
      'gradient-purple': {
        background: 'linear-gradient(135deg, #f093fb, #f5576c, #c084fc, #f093fb)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 15s ease infinite'
      },
      'gradient-green': {
        background: 'linear-gradient(135deg, #4facfe, #00f2fe, #38bdf8, #4facfe)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 10s ease infinite'
      },
      'gradient-orange': {
        background: 'linear-gradient(135deg, #fa709a, #fee140, #fb923c, #fa709a)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 14s ease infinite'
      },
      'gradient-pink': {
        background: 'linear-gradient(135deg, #a8edea, #fed6e3, #fda4af, #a8edea)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 13s ease infinite'
      }
    };
    return backgroundStyles[background];
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={getBackgroundStyle()}
    >
      {children}
    </div>
  );
};
