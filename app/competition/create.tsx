import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import DatePickerField from '@/components/ui/date-picker-field';
import { useCreateCompetition } from '@/features/competitions/hooks/useCreateCompetition';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExerciseChipListProps {
  exercises: { id: string; name: string }[];
  selectedExerciseId?: string;
  onSelect: (exerciseId: string) => void;
  loading: boolean;
  error?: string;
}

function ExerciseChipList({
  exercises,
  selectedExerciseId,
  onSelect,
  loading,
  error,
}: ExerciseChipListProps) {
  if (loading) return <ActivityIndicator color="#3b82f6" />;

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {exercises.map((ex) => {
          const isSelected = ex.id === selectedExerciseId;
          return (
            <Pressable key={ex.id} onPress={() => onSelect(ex.id)}>
              <Badge variant={'default'} className={cn('px-4 py-2', !isSelected && 'bg-white')}>
                <Text
                  className={cn(
                    'text-secondary-foreground',
                    isSelected && 'text-primary-foreground font-semibold'
                  )}
                >
                  {ex.name}
                </Text>
              </Badge>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

export default function CreateCompetitionScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { form, exercises, loading, today, handleDateChange, onSubmit } =
    useCreateCompetition(groupId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedExerciseId = watch('exercise_id');
  const startDateStr = watch('start_date');
  const endDateStr = watch('end_date');

  const todayStr = today.toISOString().split('T')[0];

  const daysCount = (() => {
    if (!startDateStr || !endDateStr || endDateStr < startDateStr) return 0;
    return (
      Math.round(
        (new Date(`${endDateStr}T00:00:00`).getTime() -
          new Date(`${startDateStr}T00:00:00`).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  })();

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <View className="flex-row items-center gap-4 bg-white px-4 pt-14 pb-4 dark:bg-gray-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
        >
          <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black dark:text-white">Nueva competición</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Título *
        </Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Ej: Reto de press banca abril"
              error={!!errors.title}
            />
          )}
        />
        {errors.title && <Text className="mt-1 text-xs text-red-500">{errors.title.message}</Text>}

        <Text className="mt-5 mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Descripción
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Textarea
              value={value}
              onChangeText={onChange}
              placeholder="Reglas, objetivo, etc."
              numberOfLines={4}
              error={!!errors.description}
            />
          )}
        />
        {errors.description && (
          <Text className="mt-1 text-xs text-red-500">{errors.description.message}</Text>
        )}

        <Text className="mt-5 mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Ejercicio *
        </Text>
        <ExerciseChipList
          exercises={exercises}
          selectedExerciseId={selectedExerciseId}
          loading={exercises.length === 0}
          onSelect={(exerciseId) => setValue('exercise_id', exerciseId, { shouldValidate: true })}
          error={errors.exercise_id?.message}
        />

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1">
            <DatePickerField
              label="Inicio *"
              value={startDateStr}
              minDateStr={todayStr}
              error={errors.start_date?.message}
              onChange={(dateStr) => {
                handleDateChange('start_date', new Date(`${dateStr}T00:00:00`));
              }}
            />
          </View>

          <View className="flex-1">
            <DatePickerField
              label="Fin *"
              value={endDateStr}
              minDateStr={startDateStr || todayStr}
              error={errors.end_date?.message}
              onChange={(dateStr) => {
                handleDateChange('end_date', new Date(`${dateStr}T00:00:00`));
              }}
            />
          </View>
        </View>

        {daysCount > 0 && (
          <Text className="mt-2 text-xs text-gray-400">
            Duración: {daysCount} día{daysCount !== 1 ? 's' : ''} · 1 evidencia por día por
            participante
          </Text>
        )}

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          loading={loading}
          className="mt-8 rounded-2xl py-4"
        >
          <Text className="text-center text-base font-bold text-white">
            {loading ? 'Creando...' : 'Crear competición'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}
