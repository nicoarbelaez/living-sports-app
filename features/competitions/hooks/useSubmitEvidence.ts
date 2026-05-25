import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EvidenceFormValues } from '../schemas/evidence.schema';

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

  const { error } = await supabase.functions.invoke('submit-evidence', { body: formData });
  if (error) throw new Error(error.message);
}

export function useSubmitEvidence(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: submitEvidence,
    onSuccess: options?.onSuccess,
  });
}
