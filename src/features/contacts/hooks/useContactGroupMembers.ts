import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addContactsToGroup, removeContactsFromGroup } from '../services/contactGroupMembers';

export function useContactGroupMembers() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({ groupId, contactIds }: { groupId: string; contactIds: string[] }) => 
      addContactsToGroup(groupId, contactIds),
    onSuccess: () => {
      // Invalidate any queries that might be affected by this mutation
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: ({ groupId, contactIds }: { groupId: string; contactIds: string[] }) => 
      removeContactsFromGroup(groupId, contactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contactGroups'] });
    }
  });

  return {
    addContactsToGroup: async (params: { groupId: string; contactIds: string[] }): Promise<boolean> => {
      return new Promise((resolve) => {
        addMutation.mutate(params, {
          onSuccess: (success) => resolve(success),
          onError: () => resolve(false)
        });
      });
    },
    removeContactsFromGroup: async (params: { groupId: string; contactIds: string[] }): Promise<boolean> => {
      return new Promise((resolve) => {
        removeMutation.mutate(params, {
          onSuccess: (success) => resolve(success),
          onError: () => resolve(false)
        });
      });
    },
    isAddingContacts: addMutation.isPending,
    isRemovingContacts: removeMutation.isPending
  };
}
