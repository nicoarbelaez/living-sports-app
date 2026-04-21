import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfileStore } from '@/features/profile/stores/useProfileStore';
import { useAuth } from '@/providers/AuthProvider';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/profile';

export function useProfileSync() {
  const { session } = useAuth();
  const { setProfile, clearProfile, refreshProfile } = useProfileStore();

  useEffect(() => {
    if (!session) {
      clearProfile();
      return;
    }

    const userId = session.user.id;

    refreshProfile(userId);

    const channel = supabase
      .channel(`profile:${userId}`)
      .on<UserProfile>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: RealtimePostgresUpdatePayload<UserProfile>) => {
          setProfile(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[ProfileSync] Realtime channel error — will rely on manual refresh');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, setProfile, clearProfile, refreshProfile]);
}
