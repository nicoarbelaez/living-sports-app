import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mapGroupRow } from '@/types/group';

export function usePublicCommunities(currentUserId?: string) {
  return useQuery({
    queryKey: ['communities', 'public', currentUserId],
    queryFn: async () => {
      const base = supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .eq('is_deleted', false)
        .order('members_count', { ascending: false });

      const { data, error } = currentUserId
        ? await base.neq('owner_id', currentUserId)
        : await base;

      if (error) throw error;
      return (data ?? []).map(mapGroupRow);
    },
  });
}

export function useMyMemberships(userId?: string) {
  return useQuery({
    queryKey: ['communities', 'memberships', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId!)
        .eq('status', 'active');
      if (error) throw error;
      return (data ?? []).map((r) => r.group_id as string);
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useOwnsACommunity(userId?: string) {
  return useQuery({
    queryKey: ['communities', 'owned', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('groups')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', userId!)
        .eq('is_deleted', false);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useMyOwnedCommunity(userId?: string) {
  return useQuery({
    queryKey: ['communities', 'owned-group', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('owner_id', userId!)
        .eq('is_deleted', false)
        .maybeSingle();
      if (error) throw error;
      return data ? mapGroupRow(data) : null;
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export interface CommunityDetail {
  id: string;
  name: string;
  image_url: string | null;
  emoji: string | null;
  members_count: number;
  description: string | null;
  owner_id: string;
  is_public: boolean;
  isMember: boolean;
}

export function useCommunityDetailQuery(id: string | undefined, userId?: string) {
  return useQuery({
    queryKey: ['community', id, userId],
    queryFn: async (): Promise<CommunityDetail | null> => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, image_url, emoji, members_count, description, owner_id, is_public')
        .eq('id', id!)
        .eq('is_deleted', false)
        .single();

      if (error || !data) return null;

      let isMember = false;
      if (userId) {
        const { data: membership } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', id!)
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();
        isMember = !!membership;
      }

      return { ...data, isMember };
    },
    enabled: !!id,
  });
}
