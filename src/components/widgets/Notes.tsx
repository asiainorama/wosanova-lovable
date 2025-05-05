
import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface NotesProps {
  onClose?: () => void;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const Notes: React.FC<NotesProps> = ({ onClose }) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<NoteItem>({
    id: '',
    title: '',
    content: '',
    updatedAt: ''
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load notes from localStorage on component mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('userNotes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes) as NoteItem[];
        setNotes(parsedNotes);
        
        // Select the most recent note if there are any
        if (parsedNotes.length > 0) {
          const mostRecent = parsedNotes.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setSelectedNoteId(mostRecent.id);
          setCurrentNote(mostRecent);
        }
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las notas",
        variant: "destructive",
      });
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('userNotes', JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las notas",
        variant: "destructive",
      });
    }
  }, [notes]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback close method if no onClose provided
      window.history.back();
    }
  };

  const createNewNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: `Nueva nota ${notes.length + 1}`,
      content: '',
      updatedAt: new Date().toISOString()
    };
    
    setNotes([...notes, newNote]);
    setSelectedNoteId(newNote.id);
    setCurrentNote(newNote);
    
    toast({
      title: "Nueva nota creada",
      description: newNote.title,
    });
  };

  const saveCurrentNote = () => {
    if (!selectedNoteId) return;
    
    const updatedNote = {
      ...currentNote,
      updatedAt: new Date().toISOString()
    };
    
    setNotes(notes.map(note => 
      note.id === selectedNoteId ? updatedNote : note
    ));
    
    toast({
      title: "Nota guardada",
      description: "Los cambios han sido guardados",
    });
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
    // If we're deleting the currently selected note, select another or clear
    if (id === selectedNoteId) {
      const remainingNotes = notes.filter(note => note.id !== id);
      if (remainingNotes.length > 0) {
        const newSelectedNote = remainingNotes[0];
        setSelectedNoteId(newSelectedNote.id);
        setCurrentNote(newSelectedNote);
      } else {
        setSelectedNoteId(null);
        setCurrentNote({
          id: '',
          title: '',
          content: '',
          updatedAt: ''
        });
      }
    }
    
    toast({
      title: "Nota eliminada",
      variant: "destructive",
    });
  };

  const selectNote = (id: string) => {
    const selectedNote = notes.find(note => note.id === id);
    if (selectedNote) {
      setSelectedNoteId(id);
      setCurrentNote(selectedNote);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-background flex flex-col h-full w-full rounded-lg">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">Notas</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Notes list sidebar */}
        <div className={`${isMobile ? (selectedNoteId ? 'hidden' : 'flex-1') : 'w-1/3'} flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-y-auto`}>
          <div className="p-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
            <span className="font-medium">Mis notas</span>
            <Button variant="ghost" size="icon" onClick={createNewNote}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="overflow-y-auto">
            {notes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No hay notas</p>
                <p className="text-sm">Crea una nueva nota con el botón +</p>
              </div>
            ) : (
              notes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  className={`p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer ${selectedNoteId === note.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate">{note.title}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(note.updatedAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Note editor */}
        <div className={`flex-1 flex flex-col ${isMobile ? (selectedNoteId ? 'flex-1' : 'hidden') : 'flex-1'}`}>
          {selectedNoteId ? (
            <>
              <div className="p-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedNoteId(null)}
                    className="mr-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Input
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
                  className="border-none text-lg font-medium focus-visible:ring-0 p-0 h-auto flex-1"
                  placeholder="Título de la nota"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={saveCurrentNote}
                  className="gap-1 ml-1"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar</span>
                </Button>
              </div>
              
              <Textarea 
                placeholder="Escribe tu nota aquí..."
                className="flex-1 resize-none text-base p-3 border-none focus-visible:ring-0"
                value={currentNote.content}
                onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
              <p>Selecciona una nota o crea una nueva</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={createNewNote}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Nota
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
