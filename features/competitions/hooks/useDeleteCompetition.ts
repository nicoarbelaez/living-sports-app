import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseDeleteCompetitionOptions {
  onSuccess?: () => void;
}

export function useDeleteCompetition({ onSuccess }: UseDeleteCompetitionOptions = {}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCompetition = async (competitionId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-competition', {
        body: { competition_id: competitionId },
      });
      if (error) {
        let message = error.message;
        try {
          const body = await (error as any).context?.json?.();
          if (body?.error) message = body.error;
        } catch {}
        throw new Error(message);
      }
      onSuccess?.();
    } catch (e) {
      console.error('[useDeleteCompetition]', e);
      throw e;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteCompetition, isDeleting };
}
