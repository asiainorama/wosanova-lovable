
/**
 * Servicio ultrarrápido de precarga de imágenes
 */
import { AppData } from '@/data/apps';

class FastImagePreloader {
  private preloadedImages = new Set<string>();
  private preloadQueue: string[] = [];
  private isProcessing = false;

  /**
   * Precarga inmediata de imágenes críticas
   */
  async preloadCriticalImages(apps: AppData[]): Promise<void> {
    // Precargar las primeras 20 imágenes inmediatamente
    const criticalApps = apps.slice(0, 20);
    
    console.log(`Preloading ${criticalApps.length} critical images...`);
    
    const promises = criticalApps.map(app => {
      if (app.icon && !app.icon.includes('placeholder')) {
        return this.preloadSingleImage(app.icon, true);
      }
      return Promise.resolve();
    });

    await Promise.allSettled(promises);
    
    // Continuar con el resto en segundo plano
    const remainingApps = apps.slice(20);
    this.queueBackgroundPreload(remainingApps);
  }

  /**
   * Precarga una sola imagen con máxima prioridad
   */
  private async preloadSingleImage(url: string, highPriority = false): Promise<boolean> {
    if (this.preloadedImages.has(url)) {
      return true;
    }

    return new Promise((resolve) => {
      const img = new Image();
      
      // Configurar para máxima velocidad
      img.decoding = 'async';
      if (highPriority) {
        img.loading = 'eager';
      }
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, highPriority ? 2000 : 1000);
      
      img.onload = () => {
        clearTimeout(timeout);
        this.preloadedImages.add(url);
        
        // Añadir prefetch link para caché del navegador
        this.addPrefetchLink(url);
        
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  }

  /**
   * Añade un link de prefetch al DOM para caché del navegador
   */
  private addPrefetchLink(url: string): void {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'image';
      link.type = 'image/*';
      
      document.head.appendChild(link);
      
      // Limpiar después de 30 segundos
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      }, 30000);
    }
  }

  /**
   * Cola de precarga en segundo plano
   */
  private queueBackgroundPreload(apps: AppData[]): void {
    const urls = apps
      .map(app => app.icon)
      .filter(icon => icon && !icon.includes('placeholder') && !this.preloadedImages.has(icon)) as string[];
    
    this.preloadQueue.push(...urls);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Procesa la cola de precarga de forma eficiente
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    // Procesar en lotes pequeños para no saturar la red
    const batchSize = 5;
    
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, batchSize);
      
      await Promise.allSettled(
        batch.map(url => this.preloadSingleImage(url, false))
      );
      
      // Pequeña pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
  }

  /**
   * Verifica si una imagen está precargada
   */
  isImagePreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  /**
   * Limpia la caché de imágenes precargadas
   */
  clearCache(): void {
    this.preloadedImages.clear();
    this.preloadQueue = [];
  }
}

export const fastImagePreloader = new FastImagePreloader();
