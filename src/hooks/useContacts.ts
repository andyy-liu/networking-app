import { useEffect } from 'react'
import { useAuth } from "@/context/AuthContext";
import { Contact } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { useTodos } from "./useTodos";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as contactsService from '@/services/contacts';

export function useContacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { fetchTodos } = useTodos();

  // Fetch contacts using React Query
  const { 
    data: contacts = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return await contactsService.fetchContacts(user.id);
    },
    enabled: !!user,
  });
  
  // Use useEffect for side effects
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      fetchTodos(contacts);
    }
  }, [contacts, fetchTodos]);
  
  // Error handling
  useEffect(() => {
    if (isError) {
      console.error("Error fetching contacts");
      toast({
        title: "Error",
        description: "Failed to load your contacts",
        variant: "destructive",
      });
    }
  }, [isError]);

  // Mutation for adding a contact
  const addContactMutation = useMutation({
    mutationFn: async (newContactData: Omit<Contact, "id">) => {
      if (!user) throw new Error("User not authenticated");
      return await contactsService.createContact(user.id, newContactData);
    },
    // Use onSuccess for cache updates
    onSuccess: (newContact: Contact) => {
      queryClient.setQueryData(['contacts', user?.id], (oldContacts: Contact[] | undefined) => 
        [newContact, ...(oldContacts || [])]);
      
      toast({
        title: "Contact added",
        description: `${newContact.name} has been added to your contacts.`,
      });
    },
    onError: (error) => {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add the contact",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating a contact
  const updateContactMutation = useMutation({
    mutationFn: async (updatedContact: Contact) => {
      if (!user) throw new Error("User not authenticated");
      // Make sure service returns the updated contact
      await contactsService.updateContact(user.id, updatedContact);
      return updatedContact; // Return the updated contact object to fix the void error
    },
    onSuccess: (updatedContact: Contact) => {
      queryClient.setQueryData(['contacts', user?.id], (oldContacts: Contact[] | undefined) =>
        oldContacts?.map(contact => 
          contact.id === updatedContact.id ? updatedContact : contact
        ) || []
      );
      
      toast({
        title: "Contact updated",
        description: `${updatedContact.name} has been updated.`,
      });
    },
    onError: (error) => {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: "Failed to update the contact",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting contacts
  const deleteContactsMutation = useMutation({
    mutationFn: async (contactIds: string[]) => {
      if (!user) throw new Error("User not authenticated");
      await contactsService.deleteContacts(user.id, contactIds);
      return contactIds; // Return the deleted IDs to fix the void error
    },
    onSuccess: (deletedIds: string[]) => {
      queryClient.setQueryData(['contacts', user?.id], (oldContacts: Contact[] | undefined) =>
        oldContacts?.filter(contact => !deletedIds.includes(contact.id)) || []
      );
      
      toast({
        title: "Contacts deleted",
        description: `${deletedIds.length} contact(s) have been deleted.`,
      });
    },
    onError: (error) => {
      console.error("Error deleting contacts:", error);
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
    },
  });

  return {
    contacts,
    isLoading,
    isError,
    addContact: addContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContacts: deleteContactsMutation.mutate,
  };
}