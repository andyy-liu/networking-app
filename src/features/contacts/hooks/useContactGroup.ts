import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchContactGroup, 
  fetchContactsInGroup, 
  updateContactGroupName,
  updateContact
} from '../services/contactGroups';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Contact, ContactGroup } from '../types';
import { useContactGroupMembers } from './useContactGroupMembers';

export function useContactGroup(groupId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const groupQuery = useQuery<ContactGroup | null>({
    queryKey: ['contactGroup', groupId],
    queryFn: () => fetchContactGroup(groupId, user?.id || ''),
    enabled: !!user && !!groupId,
  });

  const contactsQuery = useQuery<Contact[]>({
    queryKey: ['groupContacts', groupId],
    queryFn: () => fetchContactsInGroup(groupId, user?.id || ''),
    enabled: !!user && !!groupId,
  });

  const updateGroupMutation = useMutation({
    mutationFn: (name: string) => 
      updateContactGroupName(groupId, user?.id || '', name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactGroup', groupId] });
      queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: (contact: Contact) => 
      updateContact(contact, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupContacts', groupId] });
    }
  });

  const { removeContactsFromGroup } = useContactGroupMembers();

  return {
    group: groupQuery.data,
    contacts: contactsQuery.data || [],
    isLoading: groupQuery.isLoading || contactsQuery.isLoading,
    isError: groupQuery.isError || contactsQuery.isError,
    updateGroupName: async (name: string): Promise<boolean> => {
      return new Promise((resolve) => {
        updateGroupMutation.mutate(name, {
          onSuccess: (success) => resolve(success),
          onError: () => resolve(false)
        });
      });
    },
    updateContact: async (contact: Contact): Promise<boolean> => {
      return new Promise((resolve) => {
        updateContactMutation.mutate(contact, {
          onSuccess: (success) => resolve(success),
          onError: () => resolve(false)
        });
      });
    },
    removeContacts: async (contactIds: string[]): Promise<boolean> => {
      return removeContactsFromGroup({ 
        groupId, 
        contactIds 
      });
    },
    isUpdatingGroup: updateGroupMutation.isPending,
    isUpdatingContact: updateContactMutation.isPending
  };
}
