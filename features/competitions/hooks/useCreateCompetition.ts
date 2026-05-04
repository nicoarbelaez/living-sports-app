import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useCompetitionsStore } from '@/features/competitions/stores/useCompetitionsStore';
import { mapCompetition } from '@/types/competition';

export interface Exercise {
  id: string;
  name: string;
}

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

const todayStr = toDateString(new Date());

const schema = z
  .object({
    title: z.string().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(300, 'Máximo 300 caracteres').optional(),
    exercise_id: z.string().min(1, 'Selecciona un ejercicio'),
    start_date: z
      .string()
      .refine((v) => v >= todayStr, 'La fecha de inicio no puede ser anterior a hoy'),
    end_date: z.string(),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: 'La fecha de fin debe ser igual o posterior al inicio',
    path: ['end_date'],
  });

export type CreateCompetitionFormData = z.infer<typeof schema>;

export function useCreateCompetition(groupId: string | undefined) {
  const router = useRouter();
  const prependCompetition = useCompetitionsStore((s) => s.prependCompetition);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const form = useForm<CreateCompetitionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      exercise_id: '',
      start_date: toDateString(today),
      end_date: toDateString(nextWeek),
    },
  });

  useEffect(() => {
    supabase
      .from('exercises')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setExercises(data ?? []));
  }, []);

  const handleDateChange = (field: 'start_date' | 'end_date', date?: Date) => {
    if (!date) return;
    const newStr = toDateString(date);
    form.setValue(field, newStr, { shouldValidate: true });
    if (field === 'start_date' && newStr > form.getValues('end_date')) {
      form.setValue('end_date', newStr, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: CreateCompetitionFormData) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const body = new FormData();
      body.append('group_id', groupId);
      body.append('title', values.title);
      body.append('exercise_id', values.exercise_id);
      body.append('start_date', values.start_date);
      body.append('end_date', values.end_date);
      if (values.description) body.append('description', values.description);

      const { data, error } = await supabase.functions.invoke('create-competition', { body });
      if (error) throw new Error(error.message);

      prependCompetition(groupId, mapCompetition(data.competition));
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear la competición');
    } finally {
      setLoading(false);
    }
  };

  return { form, exercises, loading, today, handleDateChange, onSubmit };
}
