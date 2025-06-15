
import React, { useState, useEffect } from 'react';
import { AppContextUpdater } from "@/contexts/AppContextUpdater";
import SidebarMenu from './SidebarMenu';
import FloatingWidgetsContainer from './FloatingWidgetsContainer';

const AppWithContextUpdater = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Touch event handlers for swipe detection
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // Check if it's a swipe with sufficient distance and speed, and not too much vertical movement
      const isValidSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 500;

      if (!isValidSwipe) return;

      // Right swipe from left edge to open sidebar
      if (startX <= 100 && deltaX > 0) {
        setIsSidebarOpen(true);
      }
      
      // Left swipe from right edge to close sidebar (when sidebar is open)
      if (isSidebarOpen && startX >= window.innerWidth - 100 && deltaX < 0) {
        setIsSidebarOpen(false);
      }
    };

    // Listen for custom sidebar open events from Header
    const handleSidebarOpenEvent = () => {
      setIsSidebarOpen(true);
    };

    // Add event listeners to the document
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('sidebarOpenRequested', handleSidebarOpenEvent);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('sidebarOpenRequested', handleSidebarOpenEvent);
    };
  }, [isSidebarOpen]);

  return (
    <div className="relative min-h-screen w-full">
      {/* Sidebar - positioned absolutely with higher z-index than header */}
      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onOpenChange={setIsSidebarOpen} 
      />
      
      {/* Main content - full width, not affected by sidebar */}
      <div className="w-full min-h-screen">
        <AppContextUpdater />
        {children}
        <FloatingWidgetsContainer />
      </div>
    </div>
  );
};

export default AppWithContextUpdater;
