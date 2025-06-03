
import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface NotesProps {
  onClose?: () => void;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  user_id?: string;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  // Load notes from Supabase or localStorage
  useEffect(() => {
    const loadNotes = async () => {
      if (userId) {
        // Try to load from Supabase if user is authenticated
        try {
          const { data, error } = await supabase
            .from('user_notes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

          if (data && !error) {
            const formattedNotes = data.map(note => ({
              id: note.id,
              title: note.title,
              content: note.content,
              updatedAt: note.updated_at,
              user_id: note.user_id
            }));
            setNotes(formattedNotes);
            
            if (formattedNotes.length > 0) {
              const mostRecent = formattedNotes[0];
              setSelectedNoteId(mostRecent.id);
              setCurrentNote(mostRecent);
            }
            return;
          }
        } catch (error) {
          console.error("Error loading notes from Supabase:", error);
        }
      }

      // Fallback to localStorage
      try {
        const savedNotes = localStorage.getItem('userNotes');
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes) as NoteItem[];
          setNotes(parsedNotes);
          
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
    };

    loadNotes();
  }, [userId]);

  // Save notes to both Supabase and localStorage
  const saveNotes = async (notesToSave: NoteItem[]) => {
    // Always save to localStorage
    try {
      localStorage.setItem('userNotes', JSON.stringify(notesToSave));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }

    // Save to Supabase if user is authenticated
    if (userId) {
      try {
        for (const note of notesToSave) {
          const noteData = {
            id: note.id,
            title: note.title,
            content: note.content,
            updated_at: note.updatedAt,
            user_id: userId
          };

          const { error } = await supabase
            .from('user_notes')
            .upsert(noteData, { onConflict: 'id' });

          if (error) {
            console.error("Error saving note to Supabase:", error);
          }
        }
      } catch (error) {
        console.error("Error syncing with Supabase:", error);
      }
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && selectedNoteId) {
        saveCurrentNote(false); // Silent save
      }
    }, 10000); // Auto-save every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, selectedNoteId, currentNote]);

  // Track changes in current note
  useEffect(() => {
    if (selectedNoteId) {
      const originalNote = notes.find(note => note.id === selectedNoteId);
      if (originalNote) {
        const hasChanges = 
          originalNote.title !== currentNote.title || 
          originalNote.content !== currentNote.content;
        setHasUnsavedChanges(hasChanges);
      }
    }
  }, [currentNote, notes, selectedNoteId]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const createNewNote = async () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: `Nueva nota ${notes.length + 1}`,
      content: '',
      updatedAt: new Date().toISOString(),
      user_id: userId || undefined
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    setCurrentNote(newNote);
    setHasUnsavedChanges(false);
    
    // Save immediately
    await saveNotes(updatedNotes);
    
    toast({
      title: "Nueva nota creada",
      description: newNote.title,
    });
  };

  const saveCurrentNote = async (showToast: boolean = true) => {
    if (!selectedNoteId) return;
    
    const updatedNote = {
      ...currentNote,
      updatedAt: new Date().toISOString(),
      user_id: userId || undefined
    };
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNoteId ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    setHasUnsavedChanges(false);
    
    // Save to both localStorage and Supabase
    await saveNotes(updatedNotes);
    
    if (showToast) {
      toast({
        title: "Nota guardada",
        description: "Los cambios han sido guardados",
      });
    }
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    // Delete from Supabase if user is authenticated
    if (userId) {
      try {
        await supabase
          .from('user_notes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
      } catch (error) {
        console.error("Error deleting from Supabase:", error);
      }
    }
    
    // Save updated list
    await saveNotes(updatedNotes);
    
    // If we're deleting the currently selected note, select another or clear
    if (id === selectedNoteId) {
      if (updatedNotes.length > 0) {
        const newSelectedNote = updatedNotes[0];
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

  const selectNote = async (id: string) => {
    // Save current note before switching if there are unsaved changes
    if (hasUnsavedChanges && selectedNoteId) {
      await saveCurrentNote(false);
    }

    const selectedNote = notes.find(note => note.id === id);
    if (selectedNote) {
      setSelectedNoteId(id);
      setCurrentNote(selectedNote);
      setHasUnsavedChanges(false);
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

  const handleTitleChange = (value: string) => {
    setCurrentNote({...currentNote, title: value});
  };

  const handleContentChange = (value: string) => {
    setCurrentNote({...currentNote, content: value});
  };

  return (
    <div className={`bg-background flex flex-col rounded-lg ${isMobile ? 'h-screen w-screen' : 'h-full w-full'}`}>
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
              notes
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map(note => (
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
                    onClick={() => {
                      if (hasUnsavedChanges) {
                        saveCurrentNote(false);
                      }
                      setSelectedNoteId(null);
                    }}
                    className="mr-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Input
                  value={currentNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="border-none text-lg font-medium focus-visible:ring-0 p-0 h-auto flex-1"
                  placeholder="Título de la nota"
                />
                <div className="flex items-center gap-1 ml-1">
                  {hasUnsavedChanges && (
                    <span className="text-xs text-orange-500 mr-2">Sin guardar</span>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveCurrentNote(true)}
                    className="gap-1"
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar</span>
                  </Button>
                </div>
              </div>
              
              <Textarea 
                placeholder="Escribe tu nota aquí..."
                className="flex-1 resize-none text-base p-3 border-none focus-visible:ring-0"
                value={currentNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
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
