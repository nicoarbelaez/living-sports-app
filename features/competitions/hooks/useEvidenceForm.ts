import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

import {
  evidenceSchema,
  type EvidenceFormValues,
  MAX_VIDEO_DURATION_MS,
} from '../schemas/evidence.schema';

interface UseEvidenceFormOptions {
  competitionId: string;
  exerciseId: string;
  onSuccess?: () => void;
}

export function useEvidenceForm({ competitionId, exerciseId, onSuccess }: UseEvidenceFormOptions) {
  const form = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      prValue: '',
      description: '',
      videoUri: '',
      videoDurationMs: undefined,
    },
  });

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];

    const durationMs = asset.duration ?? 0;

    if (durationMs > MAX_VIDEO_DURATION_MS) {
      form.setError('videoUri', {
        message: 'El video no puede superar los 3 minutos',
      });

      return;
    }

    form.setValue('videoUri', asset.uri, {
      shouldValidate: true,
    });

    form.setValue('videoDurationMs', durationMs);

    form.clearErrors('videoUri');
  };

  const submit = async (values: EvidenceFormValues) => {
    if (!values.videoUri) {
      throw new Error('Selecciona un video');
    }

    const formData = new FormData();

    formData.append('competition_id', competitionId);
    formData.append('exercise_id', exerciseId);
    formData.append('pr_value', values.prValue);

    if (values.description?.trim()) {
      formData.append('description', values.description.trim());
    }

    // React Native FormData no soporta new File() — usar objeto { uri, name, type }
    formData.append('file', {
      uri: values.videoUri,
      name: `evidence-${Date.now()}.mp4`,
      type: 'video/mp4',
    } as unknown as Blob);

    const { error } = await supabase.functions.invoke('submit-evidence', {
      body: formData,
    });

    if (error) {
      throw new Error(error.message);
    }

    form.reset();

    onSuccess?.();
  };

  return {
    form,
    pickVideo,
    submit,
  };
}
