
import * as React from "react"

// Puntos de quiebre para diferentes tamaños de pantalla
export const SCREEN_SIZES = {
  MOBILE: 767, // Hasta 767px se considera móvil
  TABLET: 1023, // Hasta 1023px se considera tablet
}

export type ScreenSizeType = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export function useScreenSize(): ScreenSizeType {
  const [screenSize, setScreenSize] = React.useState<ScreenSizeType>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isPortrait: true,
    isLandscape: false,
  });

  React.useEffect(() => {
    // Función para actualizar el estado basado en el tamaño de la pantalla
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        isMobile: width <= SCREEN_SIZES.MOBILE,
        isTablet: width > SCREEN_SIZES.MOBILE && width <= SCREEN_SIZES.TABLET,
        isDesktop: width > SCREEN_SIZES.TABLET,
        isPortrait: height > width,
        isLandscape: width >= height,
      });
    };
    
    // Actualizar al montar el componente
    updateScreenSize();
    
    // Configurar listener para cambios de tamaño
    window.addEventListener('resize', updateScreenSize);
    
    // Listener específico para cambios de orientación en dispositivos móviles
    window.addEventListener('orientationchange', updateScreenSize);
    
    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, []);
  
  return screenSize;
}

// Mantener la función original para compatibilidad con el código existente
export function useIsMobile() {
  const { isMobile } = useScreenSize();
  return isMobile;
}
