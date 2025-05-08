import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Contact, ContactTag } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { useTodos } from "./useTodos";

interface UseContactsProps {
  onContactUpdated?: () => void;
}

export function useContacts({ onContactUpdated }: UseContactsProps = {}) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  const { fetchTodos } = useTodos();

  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const transformedContacts: Contact[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role || "",
        company: item.company || "",
        tags: item.tags as ContactTag[],
        dateOfContact: item.dateofcontact,
        status: item.status as Contact["status"],
        todos: [],
      }));

      setContacts(transformedContacts);

      if (transformedContacts.length > 0) {
        await fetchTodos(transformedContacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load your contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (newContactData: Omit<Contact, "id">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contacts")
        .insert({
          user_id: user.id,
          name: newContactData.name,
          email: newContactData.email,
          role: newContactData.role,
          company: newContactData.company,
          tags: newContactData.tags,
          dateofcontact: newContactData.dateOfContact,
          status: newContactData.status,
        })
        .select()
        .single();

      if (error) throw error;

      const newContact: Contact = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || "",
        company: data.company || "",
        tags: data.tags as ContactTag[],
        dateOfContact: data.dateofcontact,
        status: data.status as Contact["status"],
        todos: [],
      };

      setContacts((prev) => [newContact, ...prev]);
      onContactUpdated?.();

      toast({
        title: "Contact added",
        description: `${newContact.name} has been added to your contacts.`,
      });

      return newContact;
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add the contact",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateContact = async (updatedContact: Contact) => {
    if (!user) return;

    try {
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

      if (error) throw error;

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === updatedContact.id
            ? {
                ...updatedContact,
                todos: contact.todos || [],
              }
            : contact
        )
      );

      onContactUpdated?.();

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

  const deleteContacts = async (contactIds: string[]) => {
    if (!user || contactIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .in("id", contactIds)
        .eq("user_id", user.id);

      if (error) throw error;

      setContacts((prev) =>
        prev.filter((contact) => !contactIds.includes(contact.id))
      );
      setSelectedContacts([]);
      onContactUpdated?.();

      toast({
        title: "Contacts deleted",
        description: `${contactIds.length} contact(s) have been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting contacts:", error);
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
    }
  };

  const selectContact = (contact: Contact, isSelected: boolean) => {
    if (isSelected) {
      setSelectedContacts((prev) => [...prev, contact]);
    } else {
      setSelectedContacts((prev) => prev.filter((c) => c.id !== contact.id));
    }
  };

  return {
    contacts,
    loading,
    selectedContacts,
    fetchContacts,
    addContact,
    updateContact,
    deleteContacts,
    selectContact,
  };
} 