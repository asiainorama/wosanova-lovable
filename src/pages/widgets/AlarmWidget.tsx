
import React from 'react';
import Alarm from '@/components/widgets/Alarm';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const AlarmWidget = () => {
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
          <DialogTitle>Alarmas</DialogTitle>
        </VisuallyHidden>
        <Alarm onClose={() => navigate('/')} />
      </DialogContent>
    </Dialog>
  );
};

export default AlarmWidget;
