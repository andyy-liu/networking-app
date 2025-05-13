import { supabase } from "@/lib/client";
import { Todo } from "../types";
import { format } from "date-fns";
import { Contact } from "@/features/contacts/types";

/**
 * Fetch todos for a specific user, optionally filtered by contact
 */
export async function fetchTodos(userId: string, contactId?: string): Promise<Todo[]> {
  let query = supabase
    .from("contact_todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (contactId) {
    query = query.eq("contact_id", contactId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    contactId: item.contact_id,
    task: item.task,
    dueDate: item.due_date,
    completed: item.completed,
    createdAt: item.created_at,
  }));
}

/**
 * Add a new todo for a specific contact
 */
export async function createTodo(
  userId: string, 
  contactId: string, 
  task: string, 
  dueDate: Date | null = null
): Promise<Todo> {
  const { data, error } = await supabase
    .from("contact_todos")
    .insert({
      contact_id: contactId,
      user_id: userId,
      task,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    contactId: data.contact_id,
    task: data.task,
    dueDate: data.due_date,
    completed: data.completed,
    createdAt: data.created_at,
  };
}

/**
 * Toggle the completion status of a todo
 */
export async function updateTodoCompletion(
  userId: string, 
  todoId: string, 
  completed: boolean
): Promise<void> {
  const { error } = await supabase
    .from("contact_todos")
    .update({ completed })
    .eq("id", todoId)
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Delete a todo
 */
export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  const { error } = await supabase
    .from("contact_todos")
    .delete()
    .eq("id", todoId)
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Update the due date of a todo
 */
export async function updateTodoDueDate(
  userId: string, 
  todoId: string, 
  dueDate: Date | null
): Promise<void> {
  const { error } = await supabase
    .from("contact_todos")
    .update({
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    })
    .eq("id", todoId)
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Helper function to update todos in contacts
 */
export function updateContactsWithTodos(contacts: Contact[], todos: Todo[]): Contact[] {
  return contacts.map(contact => ({
    ...contact,
    todos: todos.filter(todo => todo.contactId === contact.id)
  }));
}