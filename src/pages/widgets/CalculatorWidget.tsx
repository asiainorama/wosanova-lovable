
import React from 'react';
import Calculator from '@/components/widgets/Calculator';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const CalculatorWidget = () => {
  const navigate = useNavigate();

  return (
    <Dialog 
      open={true} 
      onOpenChange={(open) => {
        if (!open) navigate('/');
      }}
    >
      <DialogContent className="p-0 border-0 max-w-[350px] w-full sm:w-[350px]">
        {/* Remove the default X button from DialogContent */}
        <Calculator onClose={() => navigate('/')} />
      </DialogContent>
    </Dialog>
  );
};

export default CalculatorWidget;
