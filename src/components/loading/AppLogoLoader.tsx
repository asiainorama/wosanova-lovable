
import React from 'react';

const AppLogoLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative">
        {/* Logo SVG con animación de relleno */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="animate-pulse"
        >
          {/* Fondo del logo */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="20"
            fill="currentColor"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Icono de grid/apps */}
          <g className="text-primary">
            {/* Cuadraditos del grid con animación de relleno */}
            <rect x="25" y="25" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-1" />
            <rect x="45" y="25" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-2" />
            <rect x="65" y="25" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-3" />
            <rect x="25" y="45" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-4" />
            <rect x="45" y="45" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-5" />
            <rect x="65" y="45" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-6" />
            <rect x="25" y="65" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-7" />
            <rect x="45" y="65" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-8" />
            <rect x="65" y="65" width="15" height="15" rx="3" fill="currentColor" className="animate-fill-9" />
          </g>
        </svg>
        
        {/* Texto de carga */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            Cargando aplicaciones...
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fillColor {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
        
        .animate-fill-1 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0s; }
        .animate-fill-2 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.1s; }
        .animate-fill-3 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.2s; }
        .animate-fill-4 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.3s; }
        .animate-fill-5 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.4s; }
        .animate-fill-6 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.5s; }
        .animate-fill-7 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.6s; }
        .animate-fill-8 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.7s; }
        .animate-fill-9 { animation: fillColor 1.5s ease-in-out infinite; animation-delay: 0.8s; }
      `}</style>
    </div>
  );
};

export default AppLogoLoader;
