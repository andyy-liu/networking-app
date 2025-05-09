import React, { useState, useEffect } from "react";
import { Contact, Todo } from "@/lib/types";
import { supabase } from "@/lib/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Save,
  CheckCircle2,
  Circle,
  X,
  Plus,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useTodos } from "@/hooks/useTodos";

interface ContactNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface TodoPanelProps {
  open: boolean;
  onClose: () => void;
  contact: Contact | null;
  onTodoAdded: (contactId: string, todo: Todo) => void;
  onTodoCompleted: (
    contactId: string,
    todoId: string,
    completed: boolean
  ) => void;
}

export const TodoPanel: React.FC<TodoPanelProps> = ({
  open,
  onClose,
  contact,
  onTodoAdded,
  onTodoCompleted,
}) => {
  const { user } = useAuth();
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [note, setNote] = useState<ContactNote | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    todos,
    loading: todosLoading,
    fetchTodos,
    addTodo,
    toggleTodoCompletion,
    deleteTodo,
  } = useTodos({
    contactId: contact?.id,
    onTodoAdded,
    onTodoCompleted,
  });

  const editor = useEditor({
    extensions: [StarterKit, Bold, Italic, Underline, Link],
    content: "",
  });

  useEffect(() => {
    if (open && contact && user) {
      fetchTodos();
      fetchNote();
    }
  }, [open, contact, user]);

  const fetchNote = async () => {
    if (!contact || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", contact.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setNote(data as ContactNote);
        editor?.commands.setContent(data.content);
      } else {
        setNote(null);
        editor?.commands.setContent("");
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim() || !contact || !dueDate) {
      toast({
        title: "Error",
        description: "Please enter a task and select a due date",
        variant: "destructive",
      });
      return;
    }

    const added = await addTodo(newTodo, dueDate);
    if (added) {
      setNewTodo("");
      setDueDate(null);
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
          .from("contact_notes")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", note.id);

        if (error) throw error;
      } else {
        // Create new note
        const { error } = await supabase.from("contact_notes").insert({
          contact_id: contact.id,
          user_id: user.id,
          content,
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Notes saved successfully",
      });

      // Refresh the note data
      fetchNote();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {contact ? `To-dos for ${contact.name}` : "Loading..."}
          </SheetTitle>
          <SheetDescription>
            Add and manage to-dos for this contact
          </SheetDescription>
        </SheetHeader>

        {contact && (
          <div className="py-4 space-y-6">
            {/* Add new to-do section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Add a new to-do</h3>
              <div className="flex gap-2">
                <Input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Enter a task..."
                  className="flex-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[160px] justify-start text-left font-normal pl-3",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select due date*"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate as Date}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={handleAddTodo}
                  disabled={!newTodo.trim() || !dueDate || loading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                * Due date is required
              </p>
            </div>

            {/* To-do list section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">To-do List</h3>
              {todos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No to-dos yet</p>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {/* checkbox toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          toggleTodoCompletion(todo.id, todo.completed)
                        }
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>

                      {/* task text */}
                      <div className="flex-1">
                        <p className="text-sm">{todo.task}</p>
                        {todo.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due:{" "}
                            {format(
                              new Date(`${todo.dueDate}T00:00:00`),
                              "MMM d, yyyy"
                            )}
                          </p>
                        )}
                      </div>

                      {/* delete "X" */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => deleteTodo(todo.id)}
                        aria-label="Delete to‑do"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Notes</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveNote}
                  disabled={loading}
                  className="flex gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Notes
                </Button>
              </div>
              <div className="border rounded-md p-1">
                <div className="flex border-b p-2 gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={editor?.isActive("bold") ? "bg-accent" : ""}
                    title="Bold"
                  >
                    <BoldIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={editor?.isActive("italic") ? "bg-accent" : ""}
                    title="Italic"
                  >
                    <ItalicIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
                    className={editor?.isActive("underline") ? "bg-accent" : ""}
                    title="Underline"
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const url = window.prompt("Enter URL");
                      if (url) {
                        editor?.chain().focus().setLink({ href: url }).run();
                      }
                    }}
                    className={editor?.isActive("link") ? "bg-accent" : ""}
                    title="Insert Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="min-h-[300px] p-3">
                  <EditorContent
                    editor={editor}
                    className="h-full [&_div.ProseMirror]:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <SheetFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
