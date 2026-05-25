import { create } from 'zustand';
import { type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AppNotification {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

type NotificationsSchema = {
  public: {
    Tables: {
      notifications: {
        Row: NotificationRow;
        Insert: Omit<NotificationRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<NotificationRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Reuse the same underlying connection but typed for the notifications table.
const db = supabase as unknown as SupabaseClient<NotificationsSchema>;

function rowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    payload: row.payload,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationActions {
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => void;
  prependNotification: (n: AppNotification) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId) => {
    set({ isLoading: true });
    const { data } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    const notifications = (data ?? []).map(rowToNotification);
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.readAt).length,
      isLoading: false,
    });
  },

  markAsRead: async (notificationId) => {
    await db
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, readAt: new Date().toISOString() })),
      unreadCount: 0,
    })),

  prependNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
}));
