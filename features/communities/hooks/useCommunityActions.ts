import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useJoinCommunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (group_id: string) =>
      supabase.functions.invoke('join-public-community', { body: { group_id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useLeaveCommunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (group_id: string) => {
      const { data, error } = await supabase.functions.invoke('leave-community', {
        body: { group_id },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useDeleteCommunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-community', {
        body: { group_id: groupId },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useUpdateCommunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      groupId: string;
      name?: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const formData = new FormData();
      formData.append('group_id', params.groupId);
      if (params.name !== undefined) formData.append('name', params.name);
      if (params.description !== undefined) formData.append('description', params.description);
      if (params.isPublic !== undefined) formData.append('is_public', String(params.isPublic));

      const { data, error } = await supabase.functions.invoke('update-community', {
        body: formData,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['community', variables.groupId] });
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useCreateInvite = () =>
  useMutation({
    mutationFn: (body: {
      group_id: string;
      channel: 'link' | 'nickname';
      target_username?: string;
    }) => supabase.functions.invoke('invite-user', { body }),
  });

export const useRedeemInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      supabase.functions.invoke('redeem-invite', { body: { token } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  });
};
