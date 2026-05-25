import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useJoinCommunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (group_id: string) =>
      supabase.functions.invoke('join-public-community', { body: { group_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  });
};

export const useLeaveCommunity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (group_id: string) =>
      supabase.functions.invoke('leave-community', { body: { group_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
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

interface UseDeleteCommunityOptions {
  onSuccess?: () => void;
}

export function useDeleteCommunity({ onSuccess }: UseDeleteCommunityOptions = {}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCommunity = async (groupId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-community', {
        body: { group_id: groupId },
      });
      if (error) throw new Error(error.message);
      onSuccess?.();
    } catch (e) {
      console.error('[useDeleteCommunity]', e);
      throw e;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteCommunity, isDeleting };
}
