
import React, { useState } from 'react';
import { AppContextUpdater } from "@/contexts/AppContextUpdater";
import SidebarMenu from '@/components/SidebarMenu';
import FloatingWidgetsContainer from '@/components/FloatingWidgetsContainer';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

interface AppWithContextUpdaterProps {
  children: React.ReactNode;
}

export const AppWithContextUpdater: React.FC<AppWithContextUpdaterProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use the custom hook for swipe gestures
  useSwipeGestures(isSidebarOpen, setIsSidebarOpen);

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
