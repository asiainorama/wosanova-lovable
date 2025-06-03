
import React, { useState, useRef, useEffect } from 'react';
import { useFloatingWidgets } from '@/contexts/FloatingWidgetsContext';
import Calculator from '@/components/widgets/Calculator';
import UnitConverter from '@/components/widgets/UnitConverter';
import Notes from '@/components/widgets/Notes';
import Alarm from '@/components/widgets/Alarm';

interface FloatingWidgetProps {
  id: string;
  type: 'calculator' | 'converter' | 'notes' | 'alarm';
  position: { x: number; y: number };
  zIndex: number;
  isNew?: boolean;
}

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ id, type, position, zIndex, isNew }) => {
  const { closeWidget, updateWidgetPosition, bringToFront, clearNewFlag } = useFloatingWidgets();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-focus newly created widgets and clear the new flag
  useEffect(() => {
    if (isNew) {
      // Bring to front immediately for new widgets
      bringToFront(id);
      // Clear the new flag after a short delay
      setTimeout(() => {
        clearNewFlag(id);
      }, 100);
    }
  }, [isNew, id, bringToFront, clearNewFlag]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the header area
    const target = e.target as HTMLElement;
    const isHeaderArea = target.closest('[data-widget-header]');
    
    if (!isHeaderArea) return;

    setIsDragging(true);
    bringToFront(id);
    
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep widget within viewport bounds
    const maxX = window.innerWidth - 350; // Widget width
    const maxY = window.innerHeight - 400; // Widget height

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    updateWidgetPosition(id, { x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleClose = () => {
    closeWidget(id);
  };

  const renderWidget = () => {
    switch (type) {
      case 'calculator':
        return <Calculator onClose={handleClose} />;
      case 'converter':
        return <UnitConverter onClose={handleClose} />;
      case 'notes':
        return <Notes onClose={handleClose} />;
      case 'alarm':
        return <Alarm onClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={widgetRef}
      className={`fixed bg-background rounded-lg shadow-2xl border border-border ${
        isNew ? 'animate-pulse' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        zIndex,
        width: '350px',
        height: '400px',
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onMouseDown={handleMouseDown}
      onClick={() => bringToFront(id)}
    >
      <div data-widget-header className="cursor-grab active:cursor-grabbing">
        {renderWidget()}
      </div>
    </div>
  );
};

export default FloatingWidget;
