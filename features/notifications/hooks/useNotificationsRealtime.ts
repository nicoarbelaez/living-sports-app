import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNotificationStore } from '../stores/useNotificationStore';

export function useNotificationsRealtime(userId: string | undefined) {
  const prependNotification = useNotificationStore((s) => s.prependNotification);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications:' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.' + userId,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            payload: Record<string, unknown>;
            read_at: string | null;
            created_at: string;
          };
          prependNotification({
            id: row.id,
            type: row.type,
            payload: row.payload,
            readAt: row.read_at,
            createdAt: row.created_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, prependNotification]);
}
