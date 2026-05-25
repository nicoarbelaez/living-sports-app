import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RoutineDay } from '../types';

interface RoutineExerciseRow {
  id: string;
  exercise_id: string;
  sets: number;
  reps: number | null;
  rest_seconds: number | null;
  sort_order: number;
  exercises: { id: string; name: string } | null;
}

interface RoutineRow {
  id: string;
  day_of_week: number;
  title: string | null;
  name: string;
  is_rest: boolean | null;
  description: string | null;
  duration_sec: number | null;
  routine_exercises: RoutineExerciseRow[] | null;
}

export const useRoutine = (userId: string) =>
  useQuery({
    queryKey: ['routine', userId],
    queryFn: async (): Promise<Record<number, RoutineDay>> => {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          id, day_of_week, title, name, is_rest, description, duration_sec,
          routine_exercises(id, exercise_id, sets, reps, rest_seconds, sort_order, exercises(id, name))
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
      const map: Record<number, RoutineDay> = {};
      for (const r of (data ?? []) as unknown as RoutineRow[]) {
        map[r.day_of_week] = {
          id: r.id,
          dayOfWeek: r.day_of_week,
          title: r.title ?? r.name ?? null,
          isRest: r.is_rest ?? false,
          description: r.description ?? null,
          durationSec: r.duration_sec ?? null,
          exercises: ((r.routine_exercises ?? []))
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((ex) => ({
              id: ex.id,
              exerciseId: ex.exercise_id,
              exercise: ex.exercises ?? { id: ex.exercise_id, name: '' },
              sets: ex.sets,
              reps: ex.reps ?? 0,
              restSeconds: ex.rest_seconds ?? 60,
              sortOrder: ex.sort_order,
            })),
        };
      }
      return map;
    },
    enabled: !!userId,
  });
