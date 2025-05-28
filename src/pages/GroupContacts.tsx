import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ContactTable } from "@/features/contacts/components/ContactTable";
import { Contact, ContactTag } from "@/features/contacts/types";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Pencil, Save, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useContactGroup } from "@/features/contacts/hooks/useContactGroup";
import { useContactFilters } from "@/features/contacts/hooks/useContactFilters";
import { useContactSelection } from "@/features/contacts/hooks/useContactSelection";

const GroupContacts = () => {
  const { groupId = "" } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use the shared contact selection hook
  const { selectedContacts, toggleContactSelection, clearSelectedContacts } =
    useContactSelection();

  // State for group renaming
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // State for deletion confirmation
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Use the contactGroup hook to fetch group data and contacts
  const {
    group,
    contacts,
    isLoading,
    isError,
    updateGroupName: updateGroupNameMutation,
    updateContact: updateContactMutation,
    removeContacts: removeContactsMutation,
    isUpdatingGroup,
  } = useContactGroup(groupId);

  // Set newGroupName when group data is loaded
  useEffect(() => {
    if (group) {
      setNewGroupName(group.name);
    }
  }, [group]);

  // Navigate away if there's an error fetching the group
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to load group information",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isError, navigate]);

  // Use the contactFilters hook for sorting and filtering
  const {
    sortKey,
    sortDirection,
    activeTagFilter,
    filteredAndSortedContacts,
    handleSort,
    handleFilterByTag,
  } = useContactFilters(contacts);

  // Handle group name update
  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim()) return;

    const success = await updateGroupNameMutation(newGroupName.trim());

    if (success) {
      toast({
        title: "Group updated",
        description: "Group name has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update group name",
        variant: "destructive",
      });
    }

    setEditingGroupName(false);
  };
  // Handle removing contacts from group
  const handleRemoveContacts = async () => {
    if (selectedContacts.length === 0) return;

    const contactIds = selectedContacts.map((contact) => contact.id);
    const success = await removeContactsMutation(contactIds);

    if (success) {
      clearSelectedContacts();
      toast({
        title: "Contacts removed",
        description: `${contactIds.length} contact(s) removed from group.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove contacts from group",
        variant: "destructive",
      });
    }

    setShowRemoveDialog(false);
  };

  // Handle contact update
  const handleUpdateContact = async (updatedContact: Contact) => {
    const success = await updateContactMutation(updatedContact);

    if (success) {
      toast({
        title: "Contact updated",
        description: `${updatedContact.name} has been updated.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update the contact",
        variant: "destructive",
      });
    }
  };
  // Handle contact selection
  const handleSelectContact = (contact: Contact) => {
    toggleContactSelection(contact);
  };
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-800">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                {editingGroupName ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="text-xl font-semibold w-64"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleUpdateGroupName}
                      disabled={!newGroupName.trim() || isUpdatingGroup}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingGroupName(false);
                        setNewGroupName(group?.name || "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-semibold group flex items-center gap-2">
                    {group?.name || "Group"}
                    <Pencil
                      className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => setEditingGroupName(true)}
                    />
                  </h2>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {contacts.length} contacts in this group
                </p>
              </div>

              {selectedContacts.length > 0 && (
                <Button
                  variant="destructive"
                  className="gap-1"
                  onClick={() => setShowRemoveDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove from Group
                </Button>
              )}
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
                onUpdateContact={handleUpdateContact}
                selectedContacts={selectedContacts}
                onSelectContact={handleSelectContact}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}

      {/* Remove confirmation dialog */}
      <AlertDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove contacts from group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedContacts.length}{" "}
              contact(s) from this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveContacts}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupContacts;
