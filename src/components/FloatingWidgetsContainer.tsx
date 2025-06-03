
import React from 'react';
import { useFloatingWidgets } from '@/contexts/FloatingWidgetsContext';
import FloatingWidget from '@/components/FloatingWidget';

const FloatingWidgetsContainer: React.FC = () => {
  const { widgets } = useFloatingWidgets();

  return (
    <>
      {widgets.map(widget => (
        <FloatingWidget
          key={widget.id}
          id={widget.id}
          type={widget.type}
          position={widget.position}
          zIndex={widget.zIndex}
          isNew={widget.isNew}
        />
      ))}
    </>
  );
};

export default FloatingWidgetsContainer;
