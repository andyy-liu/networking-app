// filepath: c:\Users\Andy\networking-app-1\src\pages\Todos.tsx
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Contact, ContactUpdate } from "@/features/contacts/types"; // Added ContactUpdate
import { Todo } from "@/features/todos/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { TodoPanel } from "@/features/todos/components/TodoPanel";
import { TodoTable } from "@/features/todos/components/TodoTable";
import { useTodos } from "@/features/todos/hooks/useTodos";
import { useTodoFilters } from "@/features/todos/hooks/useTodoFilters";
import { TodoFilters } from "@/features/todos/components/TodoFilters";
import { AddTaskDialog } from "@/features/todos/components/AddTaskDialog";
import * as contactsService from "@/features/contacts/services/contacts";
import { updateContact as updateContactService } from "@/features/contacts/services/contacts"; // Import the service

const Todos = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isTodoPanelOpen, setIsTodoPanelOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Fetch todos and provide todo operations
  const {
    todos,
    loading,
    fetchTodos,
    toggleTodoCompletion,
    updateTodoDueDate,
  } = useTodos();

  // Filter todos
  const {
    completionFilter,
    setCompletionFilter,
    dueDateFilter,
    setDueDateFilter,
    filteredTodos,
  } = useTodoFilters(todos);

  useEffect(() => {
    if (user) {
      fetchTodos();

      const fetchContactsData = async () => {
        try {
          const contactsData = await contactsService.fetchContacts(user.id);
          setContacts(contactsData);
        } catch (error) {
          console.error("Error fetching contacts:", error);
          toast({
            title: "Error",
            description: "Failed to load contacts",
            variant: "destructive",
          });
        }
      };

      fetchContactsData();
    }
  }, [user, fetchTodos]);

  const handleOpenTodoPanel = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
      setIsTodoPanelOpen(true);
    }
  };

  const handleTodoAdded = (contactId: string, todo: Todo) => {
    fetchTodos();
  };

  const handleTodoCompleted = (
    contactId: string,
    todoId: string,
    completed: boolean
  ) => {
    fetchTodos();
  };

  const handleUpdateContact = async (contactToUpdate: ContactUpdate) => {
    if (!user || !selectedContact) return;
    try {
      await updateContactService(selectedContact.id, contactToUpdate);
      // Refetch contacts to update the local state
      const contactsData = await contactsService.fetchContacts(user.id);
      setContacts(contactsData);
      // Update selectedContact if it's the one being edited
      const updatedSelectedContact = contactsData.find(
        (c) => c.id === selectedContact.id
      );
      if (updatedSelectedContact) {
        setSelectedContact(updatedSelectedContact);
      }
      toast({
        title: "Contact Updated",
        description: "Contact details saved successfully in Todos page.",
      });
    } catch (error) {
      console.error("Error updating contact in Todos page:", error);
      toast({
        title: "Error",
        description: "Failed to update contact.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-800 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Todos</h1>

            <TodoFilters
              completionFilter={completionFilter}
              dueDateFilter={dueDateFilter}
              onCompletionFilterChange={setCompletionFilter}
              onDueDateFilterChange={setDueDateFilter}
              onAddNewTask={() => setIsAddTaskModalOpen(true)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
              <TodoTable
                todos={filteredTodos}
                contacts={contacts}
                onToggleCompletion={toggleTodoCompletion}
                onUpdateDueDate={updateTodoDueDate}
                onOpenTodoPanel={handleOpenTodoPanel}
              />
            </div>
          )}
        </main>
      </div>

      <TodoPanel
        open={isTodoPanelOpen}
        onClose={() => setIsTodoPanelOpen(false)}
        contact={selectedContact}
        onTodoAdded={handleTodoAdded}
        onTodoCompleted={handleTodoCompleted}
        onUpdateContact={handleUpdateContact} // Pass the handler
      />

      <AddTaskDialog
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        contacts={contacts}
        onTaskAdded={fetchTodos}
      />
    </div>
  );
};

export default Todos;
