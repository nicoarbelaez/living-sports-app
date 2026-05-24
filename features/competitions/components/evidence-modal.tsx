import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, Alert, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import { Upload } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);

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

  return (
    <BottomSheetModalComponent
      visible={visible}
      title="Subir evidencia"
      onClose={handleClose}
      bottomSheetRef={bottomSheetRef}
    >
      <View className="flex-1 gap-4">
        <TouchableOpacity
          onPress={handlePickVideo}
          className="border-border mb-4 items-center justify-center rounded-2xl border-2 border-dashed py-6"
        >
          <Upload size={24} color="#6b7280" />
          <Text className="text-muted-foreground mt-2 text-sm">
            {videoUri ? '✓ Video seleccionado' : 'Seleccionar video'}
          </Text>
        </TouchableOpacity>

        <Text className="text-muted-foreground text-sm font-semibold">
          {competition.exerciseName} — valor (kg / reps / seg)
        </Text>
        <Input
          value={prValue}
          onChangeText={setPrValue}
          placeholder="Ej: 100"
          keyboardType="numeric"
          className="mb-4"
        />

        <Text className="text-muted-foreground text-sm font-semibold">Descripción (opcional)</Text>
        <Textarea
          value={description}
          maxChars={500}
          onChangeText={setDescription}
          placeholder="Contexto, condiciones, etc."
          numberOfLines={2}
          className="min-h-16"
        />

        <Button
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || !videoUri || !prValue}
          className="rounded-2xl"
          size="lg"
        >
          <Text className="text-primary-foreground text-base font-bold">Enviar evidencia</Text>
        </Button>
      </View>
    </BottomSheetModalComponent>
  );
}
