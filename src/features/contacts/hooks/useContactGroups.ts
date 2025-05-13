import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContactGroups, createContactGroup, updateContactGroup, deleteContactGroup } from '../services/contactGroups';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ContactGroup } from '../types';

export function useContactGroups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const contactGroupsQuery = useQuery<ContactGroup[]>({
    queryKey: ['contactGroups', user?.id],
    queryFn: () => fetchContactGroups(user?.id || ''),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const createGroupMutation = useMutation({
    mutationFn: (name: string) => createContactGroup(user?.id || '', name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactGroups', user?.id] });
    }
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) => 
      updateContactGroup(groupId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactGroups', user?.id] });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => deleteContactGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactGroups', user?.id] });
    }
  });

  return {
    ...contactGroupsQuery,
    createGroup: async (name: string): Promise<ContactGroup | null> => {
      return new Promise((resolve) => {
        createGroupMutation.mutate(name, {
          onSuccess: (data) => resolve(data),
          onError: () => resolve(null)
        });
      });
    },
    updateGroup: async (groupId: string, name: string): Promise<ContactGroup | null> => {
      return new Promise((resolve) => {
        updateGroupMutation.mutate({ groupId, name }, {
          onSuccess: (data) => resolve(data),
          onError: () => resolve(null)
        });
      });
    },
    deleteGroup: async (groupId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        deleteGroupMutation.mutate(groupId, {
          onSuccess: () => resolve(true),
          onError: () => resolve(false)
        });
      });
    },
    isCreating: createGroupMutation.isPending,
    isUpdating: updateGroupMutation.isPending,
    isDeleting: deleteGroupMutation.isPending
  };
}
