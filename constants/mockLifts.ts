import { Lift } from '@/types/lift';

type CommunityLifts = Record<string, Lift[]>;

export let liftsPerCommunity: CommunityLifts = {
  // Running Elite - id 1
  '1': [
    {
      id: 'l1',
      userId: 'u1',
      userName: 'Carlos M.',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'bench',
      weightKg: 140,
      reps: 5,
      createdAt: '2024-04-10',
    },
    {
      id: 'l2',
      userId: 'u2',
      userName: 'Sofia G.',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'bench',
      weightKg: 125,
      reps: 3,
      createdAt: '2024-04-10',
    },
    {
      id: 'l3',
      userId: 'u3',
      userName: 'Pedro R.',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'bench',
      weightKg: 115,
      reps: 6,
      createdAt: '2024-04-09',
    },
    {
      id: 'l4',
      userId: 'u4',
      userName: 'Ana L.',
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'bench',
      weightKg: 80,
      reps: 8,
      createdAt: '2024-04-09',
    },
    {
      id: 'l5',
      userId: 'u1',
      userName: 'Carlos M.',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'squat',
      weightKg: 200,
      reps: 5,
      createdAt: '2024-04-10',
    },
    {
      id: 'l6',
      userId: 'u2',
      userName: 'Sofia G.',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'squat',
      weightKg: 155,
      reps: 4,
      createdAt: '2024-04-09',
    },
    {
      id: 'l7',
      userId: 'u3',
      userName: 'Pedro R.',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'deadlift',
      weightKg: 230,
      reps: 3,
      createdAt: '2024-04-10',
    },
    {
      id: 'l8',
      userId: 'u4',
      userName: 'Ana L.',
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'deadlift',
      weightKg: 110,
      reps: 5,
      createdAt: '2024-04-09',
    },
  ],
  // Gym Warriors - id 2
  '2': [
    {
      id: 'l9',
      userId: 'u5',
      userName: 'Miguel F.',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'bench',
      weightKg: 160,
      reps: 3,
      createdAt: '2024-04-11',
    },
    {
      id: 'l10',
      userId: 'u6',
      userName: 'Laura T.',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'bench',
      weightKg: 95,
      reps: 6,
      createdAt: '2024-04-10',
    },
    {
      id: 'l11',
      userId: 'u5',
      userName: 'Miguel F.',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'deadlift',
      weightKg: 250,
      reps: 2,
      createdAt: '2024-04-11',
    },
    {
      id: 'l12',
      userId: 'u6',
      userName: 'Laura T.',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      exerciseId: 'squat',
      weightKg: 130,
      reps: 5,
      createdAt: '2024-04-10',
    },
  ],
};

// Para las demás comunidades, compartimos los mismos datos de la 1
for (let i = 3; i <= 8; i++) {
  liftsPerCommunity[i.toString()] = liftsPerCommunity['1'].map((l) => ({
    ...l,
    id: `${l.id}-c${i}`,
  }));
}

export const addLift = (communityId: string, lift: Lift) => {
  const current = liftsPerCommunity[communityId] ?? [];
  liftsPerCommunity = { ...liftsPerCommunity, [communityId]: [lift, ...current] };
};
