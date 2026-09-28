
/// <reference types="vite/client" />

declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';

// Add standalone property to Navigator for iOS PWA detection
interface Navigator {
  standalone?: boolean;
}
