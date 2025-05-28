import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ContactTable } from "@/features/contacts/components/ContactTable";
import { NewContactModal } from "@/features/contacts/components/NewContactModal";
import { AddToGroupModal } from "@/features/contacts/components/AddToGroupModal";
import { Contact } from "@/features/contacts/types";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, Tag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TagManagementModal } from "@/features/contacts/components/TagManagementModal";
import { TodoPanel } from "@/features/todos/components/TodoPanel";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { useContactFilters } from "@/features/contacts/hooks/useContactFilters";
import { useTodos } from "@/features/todos/hooks/useTodos";
import { Plus } from "lucide-react";

const Index = () => {
  // Contact management
  const {
    contacts,
    isLoading,
    isError,
    addContact,
    updateContact,
    deleteContacts,
    selectedContacts,
    toggleContactSelection,
    clearSelectedContacts,
  } = useContacts();

  // Sorting and filtering
  const {
    sortKey,
    sortDirection,
    activeTagFilter,
    handleSort,
    handleFilterByTag,
    filteredAndSortedContacts,
  } = useContactFilters(contacts);

  // Todo management
  const { handleTodoAdded, handleTodoCompleted } = useTodos();

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);
  const [isTodoPanelOpen, setIsTodoPanelOpen] = useState(false);

  // Selected contact states
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactForTodos, setContactForTodos] = useState<Contact | null>(null);

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsEditModalOpen(true);
  };

  const handleOpenTodoPanel = (contact: Contact) => {
    setContactForTodos(contact);
    setIsTodoPanelOpen(true);
  };

  const handleDeleteSelectedContacts = async () => {
    if (selectedContacts.length === 0) return;
    await deleteContacts(selectedContacts.map((c) => c.id));
    setIsDeleteDialogOpen(false);
  };

  const handleGroupAdded = () => {
    setIsAddToGroupModalOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-800">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Contacts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your professional network
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsTagManagementOpen(true)}
                className="gap-1"
              >
                <Tag className="h-4 w-4" />
                Manage Tags
              </Button>
              {selectedContacts.length > 0 && (
                <>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    variant="outline"
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedContacts.length})
                  </Button>
                  <Button
                    onClick={() => setIsAddToGroupModalOpen(true)}
                    variant="outline"
                    className="gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add to Group ({selectedContacts.length})
                  </Button>
                </>
              )}
              <Button
                onClick={() => setIsNewModalOpen(true)}
                className="hover:bg/90"
              >
                <Plus className="mr-2 h-4 w-4" /> New Contact
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
              <ContactTable
                contacts={filteredAndSortedContacts}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onFilterByTag={handleFilterByTag}
                activeTagFilter={activeTagFilter}
                onUpdateContact={updateContact}
                selectedContacts={selectedContacts}
                onSelectContact={toggleContactSelection}
                onOpenTodoPanel={handleOpenTodoPanel}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewContactModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={addContact}
      />

      <AddToGroupModal
        isOpen={isAddToGroupModalOpen}
        onClose={() => setIsAddToGroupModalOpen(false)}
        selectedContacts={selectedContacts}
        onGroupAdded={handleGroupAdded}
      />

      <TagManagementModal
        isOpen={isTagManagementOpen}
        onClose={() => setIsTagManagementOpen(false)}
      />

      <TodoPanel
        open={isTodoPanelOpen}
        onClose={() => setIsTodoPanelOpen(false)}
        contact={contactForTodos}
        onTodoAdded={handleTodoAdded}
        onTodoCompleted={handleTodoCompleted}
        onUpdateContact={updateContact}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contacts</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedContacts.length}{" "}
              contact(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedContacts}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
