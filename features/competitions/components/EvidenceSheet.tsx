import React, { forwardRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Controller } from 'react-hook-form';
import { Upload, Video } from 'lucide-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEvidenceForm } from '../hooks/useEvidenceForm';

interface EvidenceSheetProps {
  onClose?: () => void;
  competitionId: string;
  exerciseId: string;
  onSuccess?: () => void;
}

const EvidenceSheet = forwardRef<BottomSheetModal, EvidenceSheetProps>(
  ({ onClose, competitionId, exerciseId, onSuccess }, ref) => {
    const { form, pickVideo, submit } = useEvidenceForm({
      competitionId,
      exerciseId,
      onSuccess: () => {
        handleClose();
        onSuccess?.();
      },
    });

    const {
      control,
      handleSubmit,
      watch,
      formState: { errors, isSubmitting },
    } = form;

    const videoUri = watch('videoUri');
    const videoDurationMs = watch('videoDurationMs');

    const durationLabel = videoDurationMs
      ? `${Math.floor(videoDurationMs / 60000)}:${String(Math.floor((videoDurationMs % 60000) / 1000)).padStart(2, '0')}`
      : null;

    const onSubmit = handleSubmit(async (values) => {
      try {
        await submit(values);
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo enviar la evidencia');
      }
    });

    const handleClose = () => {
      form.reset();
      onClose?.();
    };

    return (
      <BottomSheetModalComponent ref={ref} title="Subir evidencia" onClose={handleClose}>
        <View className="flex-1 gap-4">
          {/* Video picker */}
          <TouchableOpacity
            onPress={pickVideo}
            disabled={isSubmitting}
            className={`items-center justify-center rounded-2xl border-2 border-dashed py-6 ${
              errors.videoUri ? 'border-destructive bg-destructive/5' : 'border-border'
            }`}
          >
            {videoUri ? (
              <View className="items-center gap-1">
                <Video size={24} color="#22c55e" />
                <Text className="mt-1 text-sm font-semibold text-green-600">
                  Video seleccionado
                </Text>
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

          {/* PR Value */}
          <View>
            <Text className="text-foreground mb-2 text-sm font-semibold">
              Valor (kg / reps / seg)
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
                  editable={!isSubmitting}
                  error={!!errors.prValue}
                />
              )}
            />
            {errors.prValue && (
              <Text className="text-destructive mt-1 text-xs">{errors.prValue.message}</Text>
            )}
          </View>

          {/* Description */}
          <View>
            <Text className="text-foreground mb-2 text-sm font-semibold">
              Descripción (opcional)
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Textarea
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Contexto, condiciones, etc."
                  numberOfLines={3}
                  className="min-h-20"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.description && (
              <Text className="text-destructive mt-1 text-xs">{errors.description.message}</Text>
            )}
          </View>

          <Button
            onPress={onSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            className="rounded-2xl"
            size="lg"
          >
            <Text className="text-primary-foreground text-base font-bold">Enviar evidencia</Text>
          </Button>
        </View>
      </BottomSheetModalComponent>
    );
  }
);

EvidenceSheet.displayName = 'EvidenceSheet';

export default EvidenceSheet;
