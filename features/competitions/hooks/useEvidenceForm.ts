import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Video as VideoCompressor } from 'react-native-compressor';

import {
  evidenceSchema,
  type EvidenceFormValues,
  MAX_VIDEO_DURATION_MS,
} from '../schemas/evidence.schema';

export function useEvidenceForm() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

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

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const compressedUri = await VideoCompressor.compress(
        asset.uri,
        {
          compressionMethod: 'auto',
          maxSize: 1280,        // max 720p — 30s @ ~2Mbps ≈ 7 MB
          minimumFileSizeForCompress: 20, // skip for already-small videos (< 20 MB)
        },
        (progress) => setCompressionProgress(Math.round(progress * 100))
      );

      form.setValue('videoUri', compressedUri, { shouldValidate: true });
      form.setValue('videoDurationMs', durationMs);
      form.clearErrors('videoUri');
    } catch {
      form.setError('videoUri', { message: 'No se pudo comprimir el video. Intenta de nuevo.' });
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  return { form, pickVideo, isCompressing, compressionProgress };
}
