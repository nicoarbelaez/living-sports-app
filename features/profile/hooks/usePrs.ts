import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PersonalRecord } from '../types';

interface PrRow {
  id: string;
  user_id: string;
  exercise_id: string;
  value: number;
  media_url: string | null;
  media_type: string | null;
  achieved_on: string;
  notes: string | null;
  source: string;
  is_featured: boolean | null;
  description: string | null;
  exercises: { id: string; name: string } | null;
}

export const usePrs = (userId: string) =>
  useQuery({
    queryKey: ['prs', userId],
    queryFn: async (): Promise<PersonalRecord[]> => {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*, exercises(id, name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as PrRow[]).map((r) => ({
        id: r.id,
        userId: r.user_id,
        exerciseId: r.exercise_id,
        exercise: r.exercises ?? { id: r.exercise_id, name: '' },
        value: r.value,
        mediaUrl: r.media_url ?? null,
        mediaType: (r.media_type ?? null) as 'image' | 'video' | null,
        achievedOn: r.achieved_on,
        notes: r.notes ?? null,
        source: r.source as PersonalRecord['source'],
        isFeatured: r.is_featured ?? false,
        description: r.description ?? null,
      }));
    },
    enabled: !!userId,
  });
