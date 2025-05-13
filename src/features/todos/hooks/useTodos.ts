import { useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Todo } from "../types";
import { toast } from "@/components/ui/use-toast";
import { Contact } from "@/features/contacts/types";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as todoService from '../services/todos';

interface UseTodosProps {
  contactId?: string;
  onTodoAdded?: (contactId: string, todo: Todo) => void;
  onTodoCompleted?: (contactId: string, todoId: string, completed: boolean) => void;
}

export function useTodos({ contactId, onTodoAdded, onTodoCompleted }: UseTodosProps = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query key for this specific todos request
  const todosQueryKey = contactId 
    ? ['todos', user?.id, contactId]
    : ['todos', user?.id];

  // Fetch todos using React Query
  const { 
    data: todos = [], 
    isLoading: loading,
    isError,
    refetch 
  } = useQuery({
    queryKey: todosQueryKey,
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return await todoService.fetchTodos(user.id, contactId);
    },
    enabled: !!user,
  });

  // Function to fetch todos and update contacts if needed
  const fetchTodos = useCallback(async (contacts?: Contact[]) => {
    if (!user) return;

    try {
      // Use the refetch function from React Query
      const { data } = await refetch();

      // If contacts were provided, update their todos
      if (contacts && data) {
        todoService.updateContactsWithTodos(contacts, data);
      }

      return data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "Error",
        description: "Failed to load to-dos",
        variant: "destructive",
      });
    }
  }, [user, refetch]);

  // Mutation for adding a todo
  const addTodoMutation = useMutation({
    mutationFn: async ({ task, dueDate }: { task: string; dueDate: Date | null }) => {
      if (!task.trim() || !user || !contactId) throw new Error("Invalid todo data");
      return await todoService.createTodo(user.id, contactId, task, dueDate);
    },
    onSuccess: (newTodo: Todo) => {
      // Update React Query cache with the new todo
      queryClient.setQueryData(todosQueryKey, (oldTodos: Todo[] | undefined) => 
        [newTodo, ...(oldTodos || [])]
      );
      
      // Call the callback if provided
      onTodoAdded?.(contactId!, newTodo);
      
      toast({
        title: "To-do added",
        description: "New to-do has been added successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add to-do",
        variant: "destructive",
      });
    },
  });

  // Mutation for toggling todo completion
  const toggleTodoCompletionMutation = useMutation({
    mutationFn: async ({ todoId, newStatus }: { todoId: string; newStatus: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      await todoService.updateTodoCompletion(user.id, todoId, newStatus);
      return { todoId, newStatus };
    },
    onSuccess: ({ todoId, newStatus }) => {
      // Update the cache with the new todo status
      queryClient.setQueryData(todosQueryKey, (oldTodos: Todo[] | undefined) =>
        (oldTodos || []).map((todo) =>
          todo.id === todoId ? { ...todo, completed: newStatus } : todo
        )
      );

      if (contactId) {
        onTodoCompleted?.(contactId, todoId, newStatus);
      }
    },
    onError: (error) => {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update to-do status",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a todo
  const deleteTodoMutation = useMutation({
    mutationFn: async (todoId: string) => {
      if (!user) throw new Error("User not authenticated");
      await todoService.deleteTodo(user.id, todoId);
      return todoId;
    },
    onSuccess: (todoId) => {
      // Remove the deleted todo from the cache
      queryClient.setQueryData(todosQueryKey, (oldTodos: Todo[] | undefined) =>
        (oldTodos || []).filter((todo) => todo.id !== todoId)
      );

      toast({ 
        title: "Deleted", 
        description: "To‑do removed" 
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Could not delete to‑do",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating todo due date
  const updateTodoDateMutation = useMutation({
    mutationFn: async ({ todoId, newDate }: { todoId: string; newDate: Date | null }) => {
      if (!user) throw new Error("User not authenticated");
      await todoService.updateTodoDueDate(user.id, todoId, newDate);
      return { todoId, newDate };
    },
    onSuccess: ({ todoId, newDate }) => {
      // Format the date for display in the UI
      const formattedDate = newDate 
        ? new Date(newDate).toISOString().split('T')[0] // format as YYYY-MM-DD
        : null;

      // Update the cache with the new due date
      queryClient.setQueryData(todosQueryKey, (oldTodos: Todo[] | undefined) =>
        (oldTodos || []).map((todo) =>
          todo.id === todoId ? { ...todo, dueDate: formattedDate } : todo
        )
      );

      toast({
        title: "Success",
        description: "Due date updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating due date:", error);
      toast({
        title: "Error",
        description: "Failed to update due date",
        variant: "destructive",
      });
    },
  });

  // Wrapper functions to maintain the original API
  const addTodo = async (task: string, dueDate: Date | null = null) => {
    if (!task.trim() || !user || !contactId) return null;
    
    try {
      return await addTodoMutation.mutateAsync({ task, dueDate });
    } catch (error) {
      return null;
    }
  };

  const toggleTodoCompletion = async (todoId: string, currentStatus: boolean) => {
    if (!user) return;

    const newStatus = !currentStatus;
    try {
      await toggleTodoCompletionMutation.mutateAsync({ todoId, newStatus });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!user) return;
    
    try {
      await deleteTodoMutation.mutateAsync(todoId);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const updateTodoDueDate = async (todoId: string, newDate: Date | null) => {
    if (!user) return;
    
    try {
      await updateTodoDateMutation.mutateAsync({ todoId, newDate });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Helper functions to handle todo state changes
  const handleTodoAdded = (contactId: string, todo: Todo) => {
    queryClient.setQueryData(todosQueryKey, (oldTodos: Todo[] | undefined) => 
      [todo, ...(oldTodos || [])]
    );
    onTodoAdded?.(contactId, todo);
  };

  const handleTodoCompleted = (contactId: string, todoId: string, completed: boolean) => {
    queryClient.setQueryData(todosQueryKey, (oldTodos: Todo[] | undefined) =>
      (oldTodos || []).map((todo) =>
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
