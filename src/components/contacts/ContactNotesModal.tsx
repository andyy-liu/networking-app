
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Contact } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Link as LinkIcon, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ContactNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ContactNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export const ContactNotesModal: React.FC<ContactNotesModalProps> = ({ 
  isOpen, 
  onClose, 
  contact 
}) => {
  const { user } = useAuth();
  const [note, setNote] = useState<ContactNote | null>(null);
  const [loading, setLoading] = useState(false);
  
  const editor = useEditor({
    extensions: [
      Bold,
      Italic,
      Underline,
      Link,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Here we could implement auto-save if needed
    },
  });

  useEffect(() => {
    if (isOpen && contact && user) {
      fetchNote();
    }
  }, [isOpen, contact, user]);

  const fetchNote = async () => {
    if (!contact || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contact.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setNote(data as ContactNote);
        editor?.commands.setContent(data.content);
      } else {
        setNote(null);
        editor?.commands.setContent('');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!contact || !user || !editor) return;
    
    const content = editor.getHTML();
    
    setLoading(true);
    try {
      if (note) {
        // Update existing note
        const { error } = await supabase
          .from('contact_notes')
          .update({ 
            content,
            updated_at: new Date().toISOString()
          })
          .eq('id', note.id);
        
        if (error) throw error;
      } else {
        // Create new note
        const { error } = await supabase
          .from('contact_notes')
          .insert({ 
            contact_id: contact.id,
            user_id: user.id,
            content
          });
        
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Notes saved successfully'
      });
      
      // Refresh the note data
      fetchNote();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Notes for {contact.name}</DialogTitle>
        </DialogHeader>
        
        <div className="border rounded-md p-1 mb-4">
          <div className="flex border-b p-2 gap-2">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'bg-accent' : ''}
              title="Bold"
            >
              <BoldIcon className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive('italic') ? 'bg-accent' : ''}
              title="Italic"
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={editor?.isActive('underline') ? 'bg-accent' : ''}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => {
                const url = window.prompt('Enter URL');
                if (url) {
                  editor?.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={editor?.isActive('link') ? 'bg-accent' : ''}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="min-h-[200px] p-3">
            <EditorContent editor={editor} className="h-full outline-none" />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={saveNote}
            disabled={loading}
            className="flex gap-2"
          >
            <Save className="h-4 w-4" />
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
