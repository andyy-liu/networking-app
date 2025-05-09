import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ContactTable } from "@/components/contacts/ContactTable";
import { EditContactModal } from "@/components/contacts/EditContactModal";
import { ContactNotesModal } from "@/components/contacts/ContactNotesModal";
import { Contact, ContactTag, ContactGroup } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/client";
import { useAuth } from "@/context/AuthContext";
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

const GroupContacts = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groupInfo, setGroupInfo] = useState<ContactGroup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactForNotes, setContactForNotes] = useState<Contact | null>(null);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | "default"
  >("default");
  const [activeTagFilter, setActiveTagFilter] = useState<ContactTag | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // New states for group renaming
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // New state for deletion confirmation
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Fetch group info and contacts
  useEffect(() => {
    if (user && groupId) {
      fetchGroupInfo();
      fetchGroupContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [user, groupId]);

  const fetchGroupInfo = async () => {
    if (!user || !groupId) return;

    try {
      const { data, error } = await supabase
        .from("contact_groups")
        .select("*")
        .eq("id", groupId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setGroupInfo({
        id: data.id,
        name: data.name,
        userId: data.user_id,
        createdAt: data.created_at,
      });

      // Initialize newGroupName with current name
      setNewGroupName(data.name);
    } catch (error) {
      console.error("Error fetching group info:", error);
      toast({
        title: "Error",
        description: "Failed to load group information",
        variant: "destructive",
      });
      // Navigate back to home if group not found
      navigate("/");
    }
  };

  const fetchGroupContacts = async () => {
    if (!user || !groupId) return;

    setLoading(true);
    try {
      // Get contact IDs in this group
      const { data: memberData, error: memberError } = await supabase
        .from("contact_group_members")
        .select("contact_id")
        .eq("group_id", groupId);

      if (memberError) {
        throw memberError;
      }

      if (memberData.length === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      // Get contact details
      const contactIds = memberData.map((member) => member.contact_id);
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .in("id", contactIds)
        .eq("user_id", user.id);

      if (contactsError) {
        throw contactsError;
      }

      // Transform database data to match our Contact type
      const transformedContacts: Contact[] = contactsData.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role || "",
        company: item.company || "",
        tags: item.tags as ContactTag[],
        dateOfContact: item.dateofcontact,
        status: item.status as Contact["status"],
      }));

      setContacts(transformedContacts);
    } catch (error) {
      console.error("Error fetching group contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts in this group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // New function to handle group name update
  const updateGroupName = async () => {
    if (!user || !groupId || !newGroupName.trim()) return;

    try {
      const { error } = await supabase
        .from("contact_groups")
        .update({ name: newGroupName.trim() })
        .eq("id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      if (groupInfo) {
        setGroupInfo({
          ...groupInfo,
          name: newGroupName.trim(),
        });
      }

      toast({
        title: "Group updated",
        description: "Group name has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating group name:", error);
      toast({
        title: "Error",
        description: "Failed to update group name",
        variant: "destructive",
      });
    } finally {
      setEditingGroupName(false);
    }
  };

  // New function to handle removing contacts from group
  const removeContactsFromGroup = async () => {
    if (!user || !groupId || selectedContacts.length === 0) return;

    try {
      const contactIds = selectedContacts.map((contact) => contact.id);

      const { error } = await supabase
        .from("contact_group_members")
        .delete()
        .eq("group_id", groupId)
        .in("contact_id", contactIds);

      if (error) throw error;

      // Update local state
      setContacts(
        contacts.filter((contact) => !contactIds.includes(contact.id))
      );
      setSelectedContacts([]);

      toast({
        title: "Contacts removed",
        description: `${contactIds.length} contact(s) removed from group.`,
      });
    } catch (error) {
      console.error("Error removing contacts from group:", error);
      toast({
        title: "Error",
        description: "Failed to remove contacts from group",
        variant: "destructive",
      });
    } finally {
      setShowRemoveDialog(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsEditModalOpen(true);
  };

  const handleViewNotes = (contact: Contact) => {
    setContactForNotes(contact);
    setIsNotesModalOpen(true);
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    if (!user) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("contacts")
        .update({
          name: updatedContact.name,
          email: updatedContact.email,
          role: updatedContact.role,
          company: updatedContact.company,
          tags: updatedContact.tags,
          dateofcontact: updatedContact.dateOfContact,
          status: updatedContact.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedContact.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedContacts = contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      );

      setContacts(updatedContacts);

      toast({
        title: "Contact updated",
        description: `${updatedContact.name} has been updated.`,
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: "Failed to update the contact",
        variant: "destructive",
      });
    }
  };

  const handleSort = (key: string, direction: "asc" | "desc" | "default") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleFilterByTag = (tag: ContactTag | null) => {
    setActiveTagFilter(tag);
  };

  const handleSelectContact = (contact: Contact, isSelected: boolean) => {
    if (isSelected) {
      setSelectedContacts((prev) => [...prev, contact]);
    } else {
      setSelectedContacts((prev) => prev.filter((c) => c.id !== contact.id));
    }
  };

  // Apply sorting and filtering
  const filteredAndSortedContacts = React.useMemo(() => {
    // First apply tag filtering
    let filtered = activeTagFilter
      ? contacts.filter((contact) => contact.tags.includes(activeTagFilter))
      : contacts;

    // Then apply sorting
    if (sortKey && sortDirection !== "default") {
      return [...filtered].sort((a, b) => {
        const aValue = a[sortKey as keyof Contact];
        const bValue = b[sortKey as keyof Contact];

        // Handle different types of values
        if (typeof aValue === "string" && typeof bValue === "string") {
          // For dates, convert to timestamp first
          if (sortKey === "dateOfContact") {
            const aDate = new Date(aValue).getTime();
            const bDate = new Date(bValue).getTime();
            return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
          }

          // For normal strings
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Fallback for non-string values
        return 0;
      });
    }

    return filtered;
  }, [contacts, sortKey, sortDirection, activeTagFilter]);

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
                      onClick={updateGroupName}
                      disabled={!newGroupName.trim()}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingGroupName(false);
                        setNewGroupName(groupInfo?.name || "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-semibold group flex items-center gap-2">
                    {groupInfo?.name || "Group"}
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

          {loading ? (
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
                onEditContact={handleEditContact}
                onUpdateContact={handleUpdateContact}
                onViewNotes={handleViewNotes}
                selectedContacts={selectedContacts}
                onSelectContact={handleSelectContact}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateContact}
        contact={contactToEdit}
      />

      <ContactNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        contact={contactForNotes}
      />

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
            <AlertDialogAction onClick={removeContactsFromGroup}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupContacts;
