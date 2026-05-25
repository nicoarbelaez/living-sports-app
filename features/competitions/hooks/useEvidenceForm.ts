import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';

import {
  evidenceSchema,
  type EvidenceFormValues,
  MAX_VIDEO_DURATION_MS,
} from '../schemas/evidence.schema';

export function useEvidenceForm() {
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
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const durationMs = asset.duration ?? 0;

    if (durationMs > MAX_VIDEO_DURATION_MS) {
      form.setError('videoUri', { message: 'El video no puede superar los 3 minutos' });
      return;
    }

    form.setValue('videoUri', asset.uri, { shouldValidate: true });
    form.setValue('videoDurationMs', durationMs);
    form.clearErrors('videoUri');
  };

  return { form, pickVideo };
}
