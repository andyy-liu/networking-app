import { useEffect } from 'react'
import { useAuth } from "@/context/AuthContext";
import { Contact } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { useTodos } from "./useTodos";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as contactsService from '@/services/contacts';

export function useContacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { fetchTodos } = useTodos();

  // Fetch contacts using React Query
  const { 
    data: contacts = [],  // rename data to contacts and default to an empty array
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['contacts', user?.id], // use user ID as part of the unique query key
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return await contactsService.fetchContacts(user.id);
    },
    enabled: !!user, // only run the query if user is authenticated
  });
  
  // Fetch todos when the contacts array changes
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      fetchTodos(contacts);
    }
  }, [contacts, fetchTodos]);
  
  // Handle errors in fetching contacts
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
  const addContactMutation = useMutation({ // useMutation is a hook from react-query, used for actions that change data
    mutationFn: async (newContactData: Omit<Contact, "id">) => { // remove the id property from the Contact type
      if (!user) throw new Error("User not authenticated");
      return await contactsService.createContact(user.id, newContactData);
    },
    // runs after the mutation is successful
    onSuccess: (newContact: Contact) => {
      queryClient.setQueryData(['contacts', user?.id], 
        // receives the previous data (oldContacts) and returns the new data
        // the new data is an array with the new contact at the beginning and the old contacts after
        // the old contacts are optional, so we use the || operator to return an empty array if they are undefined
        (oldContacts: Contact[] | undefined) => [newContact, ...(oldContacts || [])]);
      
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
      await contactsService.updateContact(user.id, updatedContact); // await waits until the promise is resolved then moves on to the next line
      return updatedContact; // since contactsService.updateContact returns void, we must return the updated contact here
    },
    onSuccess: (updatedContact: Contact) => {
      queryClient.setQueryData(['contacts', user?.id], (oldContacts: Contact[] | undefined) =>
        oldContacts?.map(contact => 
          // if the contact id is the same as the updated contact id, return the updated contact. otherwise, return the old contact
          contact.id === updatedContact.id ? updatedContact : contact
        ) || []// return empty array if oldContacts is undefined
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
        oldContacts?.filter(contact => !deletedIds.includes(contact.id)) || [] // !deletedIds.includes(contact.id) filters out the deleted contacts
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

  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  const selectContact = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const clearSelectedContacts = () => {
    setSelectedContacts([]);
  };

  return {
    contacts,
    isLoading,
    isError,
    addContact: addContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContacts: deleteContactsMutation.mutate,
    selectedContacts,
    selectContact,
    clearSelectedContacts,
  };
}