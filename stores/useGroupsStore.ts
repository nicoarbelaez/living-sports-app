import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Group } from '@/types/group';
import { mapGroupRow } from '@/types/group';

interface GroupsState {
  myGroups: Group[];
  publicGroups: Group[];
  isLoading: boolean;
  error: string | null;

  fetchMyGroups: (userId: string) => Promise<void>;
  fetchPublicGroups: () => Promise<void>;
  prependGroup: (group: Group) => void;
  reset: () => void;
}

const initialState = {
  myGroups: [],
  publicGroups: [],
  isLoading: false,
  error: null,
};

export const useGroupsStore = create<GroupsState>((set) => ({
  ...initialState,

  async fetchMyGroups(userId: string) {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      const myGroups = (data ?? [])
        .map((row: any) => mapGroupRow(row.groups))
        .sort((a: Group, b: Group) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      set({ myGroups, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar mis grupos', isLoading: false });
    }
  },

  async fetchPublicGroups() {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const publicGroups = (data ?? []).map((row) => mapGroupRow(row));
      set({ publicGroups, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar grupos públicos', isLoading: false });
    }
  },

  prependGroup(group: Group) {
    set((state) => ({
      myGroups: [group, ...state.myGroups],
      publicGroups: group.isPublic ? [group, ...state.publicGroups] : state.publicGroups,
    }));
  },

  reset() {
    set(initialState);
  },
}));
