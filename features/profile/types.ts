export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exercise: { id: string; name: string; emoji?: string };
  value: number;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  achievedOn: string;
  notes: string | null;
  source: 'self' | 'validated' | 'pending' | 'rejected';
  isFeatured: boolean;
  description: string | null;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exercise: { id: string; name: string; emoji?: string };
  sets: number;
  reps: number;
  restSeconds: number;
  sortOrder: number;
}

export interface RoutineDay {
  id: string;
  dayOfWeek: number; // 0=Mon ... 6=Sun
  title: string | null;
  isRest: boolean;
  description: string | null;
  durationSec: number | null;
  exercises: RoutineExercise[];
}

export const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
