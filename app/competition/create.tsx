import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { ArrowLeft, CalendarDays } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';
import { Input } from '@/components/ui/input';
import { useCreateCompetition } from '@/hooks/useCreateCompetition';

type DateField = 'start_date' | 'end_date';

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CreateCompetitionScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activePicker, setActivePicker] = useState<DateField | null>(null);
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

  const daysCount = (() => {
    if (!startDateStr || !endDateStr || endDateStr < startDateStr) return 0;
    return (
      Math.round(
        (new Date(endDateStr).getTime() - new Date(startDateStr).getTime()) / (1000 * 60 * 60 * 24)
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
            <Input
              value={value}
              onChangeText={onChange}
              placeholder="Reglas, objetivo, etc."
              multiline
              numberOfLines={3}
              className="h-24"
              error={!!errors.description}
            />
          )}
        />

        <Text className="mt-5 mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Ejercicio *
        </Text>
        {exercises.length === 0 ? (
          <ActivityIndicator color="#3b82f6" />
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {exercises.map((ex) => {
              const isSelected = ex.id === selectedExerciseId;
              return (
                <Pressable
                  key={ex.id}
                  onPress={() => setValue('exercise_id', ex.id, { shouldValidate: true })}
                  className={`rounded-full border px-4 py-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-white' : 'text-black dark:text-white'
                    }`}
                  >
                    {ex.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {errors.exercise_id && (
          <Text className="mt-1 text-xs text-red-500">{errors.exercise_id.message}</Text>
        )}

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Inicio *
            </Text>
            <TouchableOpacity
              onPress={() => setActivePicker('start_date')}
              className="h-12 flex-row items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <CalendarDays size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDisplay(startDateStr)}
              </Text>
            </TouchableOpacity>
            {errors.start_date && (
              <Text className="mt-1 text-xs text-red-500">{errors.start_date.message}</Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Fin *
            </Text>
            <TouchableOpacity
              onPress={() => setActivePicker('end_date')}
              className="h-12 flex-row items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <CalendarDays size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDisplay(endDateStr)}
              </Text>
            </TouchableOpacity>
            {errors.end_date && (
              <Text className="mt-1 text-xs text-red-500">{errors.end_date.message}</Text>
            )}
          </View>
        </View>

        {daysCount > 0 && (
          <Text className="mt-2 text-xs text-gray-400">
            Duración: {daysCount} día{daysCount !== 1 ? 's' : ''} · 1 evidencia por día por
            participante
          </Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className={`mt-8 rounded-2xl py-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          <Text className="text-center text-base font-bold text-white">
            {loading ? 'Creando...' : 'Crear competición'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {activePicker === 'start_date' && (
        <DateTimePicker
          value={new Date(startDateStr + 'T00:00:00')}
          display="spinner"
          mode="date"
          minimumDate={today}
          onChange={(_, date) => {
            setActivePicker(null);
            handleDateChange('start_date', date);
          }}
        />
      )}
      {activePicker === 'end_date' && (
        <DateTimePicker
          value={new Date(endDateStr + 'T00:00:00')}
          display="spinner"
          mode="date"
          minimumDate={new Date(startDateStr + 'T00:00:00')}
          onChange={(_, date) => {
            setActivePicker(null);
            handleDateChange('end_date', date);
          }}
        />
      )}
    </View>
  );
}
