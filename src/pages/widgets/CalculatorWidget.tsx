
import React from 'react';
import Calculator from '@/components/widgets/Calculator';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const CalculatorWidget = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <Dialog 
      open={true} 
      onOpenChange={(open) => {
        if (!open) navigate('/');
      }}
    >
      <DialogContent 
        className={`p-0 border-0 fast-animation ${isMobile ? 'w-full h-screen max-w-full m-0 rounded-none' : 'max-w-[350px] w-full sm:w-[350px]'}`}
        style={{ animationDuration: '0.15s' }}
      >
        <VisuallyHidden>
          <DialogTitle>Calculadora</DialogTitle>
        </VisuallyHidden>
        <Calculator onClose={() => navigate('/')} />
      </DialogContent>
    </Dialog>
  );
};

export default CalculatorWidget;
