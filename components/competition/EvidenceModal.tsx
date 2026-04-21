import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { Upload } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/theme';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import type { Competition } from '@/types/competition';

interface EvidenceModalProps {
  visible: boolean;
  competition: Competition;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EvidenceModal({
  visible,
  competition,
  onClose,
  onSuccess,
}: EvidenceModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [prValue, setPrValue] = useState('');
  const [description, setDescription] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { handlePickFromGallery } = useMediaPicker({ allowVideo: true, multiple: false });

  const handlePickVideo = async () => {
    const result = await handlePickFromGallery();
    if (result.length > 0) setVideoUri(result[0].uri);
  };

  const handleClose = () => {
    setPrValue('');
    setDescription('');
    setVideoUri(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!videoUri || !prValue) return;
    if (isNaN(Number(prValue)) || Number(prValue) <= 0) {
      Alert.alert('Error', 'El valor debe ser un número mayor a 0');
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('competition_id', competition.id);
      body.append('exercise_id', competition.exerciseId);
      body.append('pr_value', prValue);
      if (description) body.append('description', description);
      body.append('file', {
        uri: videoUri,
        name: `evidence-${Date.now()}.mp4`,
        type: 'video/mp4',
      } as any);

      const { error } = await supabase.functions.invoke('submit-evidence', { body });
      if (error) throw new Error(error.message);

      handleClose();
      onSuccess();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo enviar la evidencia');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'h-12 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-3xl bg-white px-5 pt-6 pb-10 dark:bg-gray-900"
        >
          <Text className="mb-5 text-lg font-bold text-black dark:text-white">Subir evidencia</Text>

          <TouchableOpacity
            onPress={handlePickVideo}
            className="mb-4 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-6 dark:border-gray-700"
          >
            <Upload size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {videoUri ? '✓ Video seleccionado' : 'Seleccionar video'}
            </Text>
          </TouchableOpacity>

          <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
            {competition.exerciseName} — valor (kg / reps / seg)
          </Text>
          <TextInput
            value={prValue}
            onChangeText={setPrValue}
            placeholder="Ej: 100"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            className={`mb-4 ${inputClass}`}
          />

          <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
            Descripción (opcional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Contexto, condiciones, etc."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
            className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || !videoUri || !prValue}
            className={`rounded-2xl py-4 ${submitting || !videoUri || !prValue ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <Text className="text-center text-base font-bold text-white">
              {submitting ? 'Enviando...' : 'Enviar evidencia'}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
