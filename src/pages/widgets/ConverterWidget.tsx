
import React, { useEffect } from 'react';
import UnitConverter from '@/components/widgets/UnitConverter';
import { useNavigate } from 'react-router-dom';
import { WidgetSheet, WidgetSheetContent } from '@/components/ui/widget-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const ConverterWidget = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navigate]);

  return (
    <WidgetSheet 
      open={true} 
      onOpenChange={(open) => {
        if (!open) navigate('/');
      }}
    >
      <WidgetSheetContent 
        className={`p-0 border shadow-xl ${isMobile ? 'rounded-xl' : 'rounded-xl'}`}
        hideCloseButton
      >
        <VisuallyHidden>
          <span>Conversor</span>
        </VisuallyHidden>
        <UnitConverter onClose={() => navigate('/')} />
      </WidgetSheetContent>
    </WidgetSheet>
  );
};

export default ConverterWidget;
