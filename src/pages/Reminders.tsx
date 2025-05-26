import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { ReminderTable } from "@/features/contacts/components/ReminderTable";
import { Contact } from "@/features/contacts/types";
import { Todo } from "@/features/todos/types";
import { useContactReminders } from "@/features/contacts/hooks/useContactReminders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TodoPanel } from "@/features/todos/components/TodoPanel";

const Reminders = () => {
  const { contacts, isLoading, isError, updateContact } = useContacts();
  const [contactForTodos, setContactForTodos] = useState<Contact | null>(null);
  
  // Use our custom hook for reminders
  const { categoryOrder, categorizedContacts } = useContactReminders(contacts);
  
  // Handle opening the todo panel
  const handleOpenTodoPanel = (contact: Contact) => {
    setContactForTodos(contact);
  };
  
  // Handle closing the todo panel
  const handleCloseTodoPanel = () => {
    setContactForTodos(null);
  };

  // Handle todo callbacks
  const handleTodoAdded = (contactId: string, todo: Todo) => {
    // Update the specific contact with the new todo
    const updatedContacts = contacts.map(contact => {
      if (contact.id === contactId) {
        const todos = contact.todos || [];
        return {
          ...contact,
          todos: [todo, ...todos]
        };
      }
      return contact;
    });
    
    // Update the UI with the new todo
    updateContact(updatedContacts.find(c => c.id === contactId)!);
  };

  const handleTodoCompleted = (contactId: string, todoId: string, completed: boolean) => {
    // Update the specific contact with the updated todo
    const updatedContacts = contacts.map(contact => {
      if (contact.id === contactId && contact.todos) {
        return {
          ...contact,
          todos: contact.todos.map(todo => 
            todo.id === todoId ? { ...todo, completed } : todo
          )
        };
      }
      return contact;
    });
    
    // Update the UI with the updated todo
    updateContact(updatedContacts.find(c => c.id === contactId)!);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-800">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Contact Reminders</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Keep track of who you need to reach out to based on last contact date
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load your contacts. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          ) : contacts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Add contacts to start tracking when you should reach out.
              </p>
            </div>
          ) : (
            <div>
              {categoryOrder.map((category, index) => (
                <ReminderTable
                  key={category}
                  category={category}
                  contacts={categorizedContacts[category]}
                  onUpdateContact={updateContact}
                  onOpenTodoPanel={handleOpenTodoPanel}
                  defaultOpen={index < 3} // Keep the first 3 tables open by default
                />
              ))}
            </div>
          )}
          
          {/* Todo panel integration */}
          <TodoPanel
            open={!!contactForTodos}
            onClose={handleCloseTodoPanel}
            contact={contactForTodos}
            onTodoAdded={handleTodoAdded}
            onTodoCompleted={handleTodoCompleted}
          />
        </main>
      </div>
    </div>
  );
};

export default Reminders;
