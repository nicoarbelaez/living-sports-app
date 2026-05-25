import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { Competition, CompetitionEntry } from '@/types/competition';
import { mapCompetition, mapEntry } from '@/types/competition';

export function useCompetitionDetail(id: string | undefined, currentUserId: string | undefined) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [compResult, entriesResult] = await Promise.all([
        supabase.from('competitions').select('*, exercises(name)').eq('id', id).single(),
        supabase
          .from('competition_entries')
          .select(
            '*, profiles!competition_entries_user_id_fkey(username, avatar_url, first_name, last_name)'
          )
          .eq('competition_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (compResult.data) setCompetition(mapCompetition(compResult.data));
      if (entriesResult.data) setEntries(entriesResult.data.map(mapEntry));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const canSubmitToday = (() => {
    if (!competition || competition.status !== 'active') return false;
    const today = new Date().toISOString().split('T')[0];
    if (today < competition.startDate || today > competition.endDate) return false;
    return !entries.some((e) => e.userId === currentUserId && e.createdAt.split('T')[0] === today);
  })();

  const handleVote = async (entryId: string, vote: 'approve' | 'reject') => {
    setVoting(entryId);
    try {
      const { error } = await supabase
        .from('competition_validations')
        .insert({ entry_id: entryId, vote, validator_id: currentUserId! });
      if (error) throw new Error(error.message);
      fetchData();
    } catch (e) {
      console.error('[useCompetitionDetail] vote error:', e);
      throw e;
    } finally {
      setVoting(null);
    }
  };

  const handleForceClose = async () => {
    if (!id) return;
    const { error } = await supabase.functions.invoke('force-close-competition', {
      body: { competition_id: id },
    });
    if (error) {
      let message = error.message;
      try {
        const body = await (error as any).context?.json?.();
        if (body?.error) message = body.error;
      } catch {}
      console.error('[handleForceClose]', message);
      throw new Error(message);
    }
    fetchData();
  };

  return {
    competition,
    entries,
    loading,
    voting,
    canSubmitToday,
    fetchData,
    handleVote,
    handleForceClose,
  };
}
