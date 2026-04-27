import { create } from 'zustand';
import type { Notification } from '@/types/notification';

// ---------------------------------------------------------------------------
// Mock data – replace with Supabase query when the backend is ready
// ---------------------------------------------------------------------------
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    actorName: 'Carlos Rueda',
    body: 'le dio like a tu publicación.',
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    timeAgo: 'hace 3 min',
    read: false,
    postId: 'post-001',
  },
  {
    id: '2',
    type: 'comment',
    actorName: 'Sofía Torres',
    body: 'comentó en tu publicación: "¡Excelente rutina de cardio! 🔥"',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    timeAgo: 'hace 15 min',
    read: false,
    postId: 'post-002',
  },
  {
    id: '3',
    type: 'response',
    actorName: 'Andrés López',
    body: 'respondió a tu comentario: "Totalmente de acuerdo contigo."',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timeAgo: 'hace 45 min',
    read: false,
    postId: 'post-003',
  },
  {
    id: '4',
    type: 'community',
    actorName: 'CrossFit Colombia',
    body: 'publicó un nuevo reto en la comunidad.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    timeAgo: 'hace 1 h',
    read: false,
    communityId: 'community-001',
  },
  {
    id: '5',
    type: 'profile',
    actorName: 'María Gómez',
    body: 'comenzó a seguirte.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    timeAgo: 'hace 3 h',
    read: false,
  },
  {
    id: '6',
    type: 'like',
    actorName: 'Juan Peña',
    body: 'le dio like a tu publicación.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    timeAgo: 'hace 5 h',
    read: true,
    postId: 'post-001',
  },
  {
    id: '7',
    type: 'community',
    actorName: 'Running Bogotá',
    body: 'te invitó a unirte a la comunidad.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    timeAgo: 'hace 8 h',
    read: true,
    communityId: 'community-002',
  },
];

// ---------------------------------------------------------------------------

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationActions {
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
