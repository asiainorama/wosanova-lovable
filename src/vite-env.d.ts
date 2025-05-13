
/// <reference types="vite/client" />

// Add standalone property to Navigator for iOS PWA detection
interface Navigator {
  standalone?: boolean;
}
