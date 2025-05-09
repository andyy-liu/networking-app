import { useState } from "react";
import { supabase } from "@/lib/client";
import { useAuth } from "@/context/AuthContext";
import { Todo } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Contact } from "@/lib/types";

interface UseTodosProps {
  contactId?: string;
  onTodoAdded?: (contactId: string, todo: Todo) => void;
  onTodoCompleted?: (contactId: string, todoId: string, completed: boolean) => void;
}

export function useTodos({ contactId, onTodoAdded, onTodoCompleted }: UseTodosProps = {}) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTodos = async (contacts?: Contact[]) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("contact_todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (contactId) {
        query = query.eq("contact_id", contactId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedTodos: Todo[] = data.map((item) => ({
        id: item.id,
        contactId: item.contact_id,
        task: item.task,
        dueDate: item.due_date,
        completed: item.completed,
        createdAt: item.created_at,
      }));

      setTodos(transformedTodos);

      // If contacts were provided, update their todos
      if (contacts) {
        contacts.forEach(contact => {
          contact.todos = transformedTodos.filter(todo => todo.contactId === contact.id);
        });
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "Error",
        description: "Failed to load to-dos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (task: string, dueDate: Date | null = null) => {
    if (!task.trim() || !user || !contactId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_todos")
        .insert({
          contact_id: contactId,
          user_id: user.id,
          task,
          due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newTodo: Todo = {
        id: data.id,
        contactId: data.contact_id,
        task: data.task,
        dueDate: data.due_date,
        completed: data.completed,
        createdAt: data.created_at,
      };

      setTodos((prev) => [newTodo, ...prev]);
      onTodoAdded?.(contactId, newTodo);

      toast({
        title: "To-do added",
        description: "New to-do has been added successfully",
      });

      return newTodo;
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add to-do",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoCompletion = async (todoId: string, currentStatus: boolean) => {
    if (!user) return;

    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from("contact_todos")
        .update({ completed: newStatus })
        .eq("id", todoId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, completed: newStatus } : todo
        )
      );

      if (contactId) {
        onTodoCompleted?.(contactId, todoId, newStatus);
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update to-do status",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("contact_todos")
        .delete()
        .eq("id", todoId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      toast({ title: "Deleted", description: "To‑do removed" });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Could not delete to‑do",
        variant: "destructive",
      });
    }
  };

  const updateTodoDueDate = async (todoId: string, newDate: Date | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("contact_todos")
        .update({
          due_date: newDate ? format(newDate, "yyyy-MM-dd") : null,
        })
        .eq("id", todoId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                dueDate: newDate ? format(newDate, "yyyy-MM-dd") : null,
              }
            : todo
        )
      );

      toast({
        title: "Success",
        description: "Due date updated successfully",
      });
    } catch (error) {
      console.error("Error updating due date:", error);
      toast({
        title: "Error",
        description: "Failed to update due date",
        variant: "destructive",
      });
    }
  };

  const handleTodoAdded = (contactId: string, todo: Todo) => {
    setTodos((prev) => [todo, ...prev]);
    onTodoAdded?.(contactId, todo);
  };

  const handleTodoCompleted = (contactId: string, todoId: string, completed: boolean) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, completed } : todo
      )
    );
    onTodoCompleted?.(contactId, todoId, completed);
  };

  return {
    todos,
    loading,
    fetchTodos,
    addTodo,
    toggleTodoCompletion,
    deleteTodo,
    updateTodoDueDate,
    handleTodoAdded,
    handleTodoCompleted,
  };
} 