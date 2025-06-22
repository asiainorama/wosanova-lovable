
import { useState, useEffect, useRef } from 'react';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';
import { supabase } from '@/integrations/supabase/client';

interface UseAppLogoResult {
  iconUrl: string;
  imageLoading: boolean;
  imageError: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  handleImageError: () => void;
  handleImageLoad: () => void;
}

/**
 * Hook optimizado para carga ultrarrápida de logos
 */
export const useAppLogo = (app: AppData): UseAppLogoResult => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); // Cambio: empezamos con false para carga más rápida
  const imageRef = useRef<HTMLImageElement>(null);
  const [iconUrl, setIconUrl] = useState<string>(() => {
    // Obtener URL inmediatamente desde caché o fuente
    return getCachedLogo(app);
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const loadIconOptimized = async () => {
      try {
        if (!isMounted) return;
        
        // 1. Verificar caché de sesión primero (más rápido)
        const cachedIconKey = `icon_${app.id}`;
        const cachedIcon = sessionStorage.getItem(cachedIconKey);
        
        if (cachedIcon && cachedIcon !== iconUrl) {
          setIconUrl(cachedIcon);
          console.log(`Using session cached icon for ${app.name}`);
          return;
        }
        
        // 2. Verificar si la imagen ya está precargada en el navegador
        if (iconUrl && await isImagePreloaded(iconUrl)) {
          console.log(`Image already preloaded for ${app.name}`);
          return;
        }
        
        // 3. Buscar en Supabase solo si no hay caché
        const { data: iconData } = await Promise.race([
          supabase
            .from('app_icons')
            .select('icon_url')
            .eq('app_id', app.id)
            .maybeSingle(),
          new Promise(resolve => setTimeout(() => resolve({ data: null }), 300)) // Timeout de 300ms
        ]) as any;

        if (!isMounted) return;

        if (iconData?.icon_url && iconData.icon_url !== iconUrl) {
          const optimizedUrl = `${iconData.icon_url}?t=${Date.now()}`;
          setIconUrl(optimizedUrl);
          sessionStorage.setItem(cachedIconKey, optimizedUrl);
          console.log(`Updated icon from Supabase for ${app.name}`);
        }
        
      } catch (err) {
        console.warn('Error in optimized icon loading:', err);
      }
    };

    // Precargar imagen inmediatamente
    if (iconUrl && !iconUrl.includes('placeholder')) {
      preloadImage(iconUrl);
    }

    loadIconOptimized();
    
    return () => {
      isMounted = false;
    };
  }, [app.id]);

  // Función optimizada para verificar si una imagen está precargada
  const isImagePreloaded = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Timeout muy corto para no bloquear
      setTimeout(() => resolve(false), 50);
      
      img.src = url;
    });
  };

  // Función para precargar imagen de forma agresiva
  const preloadImage = (url: string) => {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = url;
      
      // Añadir a caché del navegador
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'image';
      document.head.appendChild(link);
      
      // Limpiar después de 5 segundos
      setTimeout(() => {
        document.head.removeChild(link);
      }, 5000);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    
    // Intentar URL de Google como fallback inmediato
    try {
      const domain = new URL(app.url).hostname;
      const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      
      if (fallbackUrl !== iconUrl) {
        setIconUrl(fallbackUrl);
        setImageError(false);
        preloadImage(fallbackUrl);
      }
    } catch (e) {
      console.warn('Error creating fallback URL:', e);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    
    // Almacenar en caché de sesión inmediatamente
    const cachedIconKey = `icon_${app.id}`;
    sessionStorage.setItem(cachedIconKey, iconUrl);
    
    // Registrar éxito en segundo plano
    try {
      const domain = new URL(app.url).hostname;
      registerSuccessfulLogo(app.id, iconUrl, domain, 'fast-load');
    } catch (e) {
      console.warn('Error registering successful logo:', e);
    }
  };
  
  return {
    iconUrl,
    imageLoading,
    imageError,
    imageRef,
    handleImageError,
    handleImageLoad
  };
};

export default useAppLogo;
