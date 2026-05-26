import React, { useRef } from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { Controller } from 'react-hook-form';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Upload, Video, Loader } from 'lucide-react-native';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEvidenceForm } from '../hooks/useEvidenceForm';
import { useSubmitEvidence } from '../hooks/useSubmitEvidence';
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
  const { form, pickVideo, isCompressing, compressionProgress } = useEvidenceForm();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const { mutateAsync, isPending } = useSubmitEvidence({
    onSuccess: () => {
      reset();
      onClose();
      onSuccess();
    },
  });

  const videoUri = watch('videoUri');
  const videoDurationMs = watch('videoDurationMs');

  const durationLabel = videoDurationMs
    ? `${Math.floor(videoDurationMs / 60000)}:${String(Math.floor((videoDurationMs % 60000) / 1000)).padStart(2, '0')}`
    : null;

  const busy = isCompressing || isPending;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutateAsync({ competitionId: competition.id, exerciseId: competition.exerciseId, values });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo enviar la evidencia');
    }
  });

  return (
    <BottomSheetModalComponent
      visible={visible}
      title="Subir evidencia"
      onClose={handleClose}
      bottomSheetRef={bottomSheetRef}
      locked={busy}
    >
      <View className="flex-1 gap-4">
        <TouchableOpacity
          onPress={pickVideo}
          disabled={busy}
          className={`items-center justify-center rounded-2xl border-2 border-dashed py-6 ${
            errors.videoUri ? 'border-destructive bg-destructive/5' : 'border-border'
          }`}
        >
          {isCompressing ? (
            <View className="items-center gap-1">
              <Loader size={24} color="#9fe870" />
              <Text className="text-foreground mt-1 text-sm font-semibold">
                Comprimiendo... {compressionProgress}%
              </Text>
              <Text className="text-muted-foreground text-xs">Esto puede tardar unos segundos</Text>
            </View>
          ) : videoUri ? (
            <View className="items-center gap-1">
              <Video size={24} color="#22c55e" />
              <Text className="mt-1 text-sm font-semibold text-green-600">Video listo</Text>
              {durationLabel && (
                <Text className="text-muted-foreground text-xs">Duración: {durationLabel}</Text>
              )}
              <Text className="text-muted-foreground mt-1 text-xs">Toca para cambiar</Text>
            </View>
          ) : (
            <View className="items-center gap-1">
              <Upload size={24} color="#6b7280" />
              <Text className="text-muted-foreground mt-1 text-sm">
                Seleccionar video (máx. 3 min)
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.videoUri && (
          <Text className="text-destructive text-xs">{errors.videoUri.message}</Text>
        )}

        <View>
          <Text className="text-foreground mb-2 text-sm font-semibold">
            {competition.exerciseName} — valor (kg / reps / seg)
          </Text>
          <Controller
            control={control}
            name="prValue"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ej: 100"
                keyboardType="decimal-pad"
                editable={!busy}
                error={!!errors.prValue}
              />
            )}
          />
          {errors.prValue && (
            <Text className="text-destructive mt-1 text-xs">{errors.prValue.message}</Text>
          )}
        </View>

        <View>
          <Text className="text-foreground mb-2 text-sm font-semibold">Descripción (opcional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Contexto, condiciones, etc."
                numberOfLines={2}
                className="min-h-16"
                editable={!busy}
              />
            )}
          />
          {errors.description && (
            <Text className="text-destructive mt-1 text-xs">{errors.description.message}</Text>
          )}
        </View>

        <Button
          onPress={onSubmit}
          loading={busy}
          disabled={busy}
          className="rounded-2xl"
          size="lg"
        >
          <Text className="text-primary-foreground text-base font-bold">
            {isCompressing ? `Comprimiendo ${compressionProgress}%…` : isPending ? 'Subiendo…' : 'Enviar evidencia'}
          </Text>
        </Button>
      </View>
    </BottomSheetModalComponent>
  );
}
