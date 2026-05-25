import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/async/withTimeout';
import type { EvidenceFormValues } from '../schemas/evidence.schema';

const UPLOAD_TIMEOUT_MS = 3 * 60 * 1000; // 3 min — enough for a compressed video at low bandwidth

interface SubmitEvidenceInput {
  competitionId: string;
  exerciseId: string;
  values: EvidenceFormValues;
}

async function submitEvidence({ competitionId, exerciseId, values }: SubmitEvidenceInput) {
  const formData = new FormData();
  formData.append('competition_id', competitionId);
  formData.append('exercise_id', exerciseId);
  formData.append('pr_value', values.prValue);

  if (values.description?.trim()) {
    formData.append('description', values.description.trim());
  }

  formData.append('file', {
    uri: values.videoUri,
    name: `evidence-${Date.now()}.mp4`,
    type: 'video/mp4',
  } as unknown as Blob);

  const invoke = supabase.functions.invoke('submit-evidence', { body: formData });

  const { error } = await withTimeout(
    invoke,
    UPLOAD_TIMEOUT_MS,
    'La subida tardó demasiado. Verifica tu conexión e intenta de nuevo.'
  );

  if (error) throw new Error(error.message);
}

export function useSubmitEvidence(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: submitEvidence,
    onSuccess: options?.onSuccess,
  });
}
