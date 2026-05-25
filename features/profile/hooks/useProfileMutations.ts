import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useUpsertPr = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => supabase.functions.invoke('upsert-personal-record', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prs', userId] }),
  });
};

export const useDeletePr = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (record_id: string) => supabase.functions.invoke('delete-personal-record', { body: { record_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prs', userId] }),
  });
};

export const useUpsertRoutineDay = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => supabase.functions.invoke('upsert-routine-day', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', userId] }),
  });
};

export const useDeleteRoutineDay = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (day_of_week: number) => supabase.functions.invoke('delete-routine-day', { body: { day_of_week } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', userId] }),
  });
};

export const useGenerateRoutine = () =>
  useMutation({
    mutationFn: (body: object) => supabase.functions.invoke('generate-routine', { body }),
  });

export const useApplyRoutineDraft = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => supabase.functions.invoke('apply-routine-draft', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine', userId] }),
  });
};
