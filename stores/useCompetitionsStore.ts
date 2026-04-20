import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Competition } from '@/types/competition';
import { mapCompetition } from '@/types/competition';

interface CompetitionsState {
  competitions: Record<string, Competition[]>;
  isLoading: boolean;

  fetchGroupCompetitions: (groupId: string) => Promise<void>;
  prependCompetition: (groupId: string, competition: Competition) => void;
  reset: () => void;
}

export const useCompetitionsStore = create<CompetitionsState>((set) => ({
  competitions: {},
  isLoading: false,

  async fetchGroupCompetitions(groupId: string) {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*, exercises(name)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const list = (data ?? []).map(mapCompetition);
      set((state) => ({
        competitions: { ...state.competitions, [groupId]: list },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  prependCompetition(groupId: string, competition: Competition) {
    set((state) => ({
      competitions: {
        ...state.competitions,
        [groupId]: [competition, ...(state.competitions[groupId] ?? [])],
      },
    }));
  },

  reset() {
    set({ competitions: {}, isLoading: false });
  },
}));
