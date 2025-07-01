import React from 'react';

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const SidebarOverlay: React.FC<SidebarOverlayProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className={className}
      onClick={onClose}
      aria-label="Close sidebar"
    />
  );
};