export interface Exercise {
  id: string;
  name: string;
  emoji: string;
}

export interface Lift {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  createdAt: string;
}

export const EXERCISES: Exercise[] = [
  { id: 'bench', name: 'Press Banca', emoji: '🏋️' },
  { id: 'squat', name: 'Sentadilla', emoji: '🦵' },
  { id: 'deadlift', name: 'Peso Muerto', emoji: '💀' },
  { id: 'shoulder', name: 'Press Hombro', emoji: '💪' },
  { id: 'row', name: 'Remo', emoji: '🚣' },
  { id: 'curl', name: 'Curl Bíceps', emoji: '💪' },
  { id: 'pullup', name: 'Dominadas', emoji: '🔝' },
];
