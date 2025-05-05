
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

interface NotesProps {
  onClose?: () => void;
}

const Notes: React.FC<NotesProps> = ({ onClose }) => {
  const [notes, setNotes] = useState<string>('');
  const isMobile = useIsMobile();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('userNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userNotes', notes);
  }, [notes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback close method if no onClose provided
      window.history.back();
    }
  };

  return (
    <div className={`bg-background flex flex-col h-full w-full rounded-lg`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">Notas</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <Textarea 
          placeholder="Escribe tus notas aquí..."
          className="flex-1 resize-none text-base"
          value={notes}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Notes;
