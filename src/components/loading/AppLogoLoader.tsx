
import React from 'react';

const AppLogoLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center h-full w-full bg-transparent">
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
    </div>
  );
};

export default AppLogoLoader;
