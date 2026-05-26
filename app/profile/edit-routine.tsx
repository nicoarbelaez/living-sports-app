import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import {
  useUpsertRoutineDay,
  useDeleteRoutineDay,
} from '@/features/profile/hooks/useProfileMutations';
import { useRoutine } from '@/features/profile/hooks/useRoutine';
import { DAY_NAMES } from '@/features/profile/types';

interface ExerciseCatalog {
  id: string;
  name: string;
  emoji?: string;
}

interface LocalExercise {
  tempId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseEmoji?: string;
  sets: string;
  reps: string;
  restSeconds: string;
}

interface DayState {
  isRest: boolean;
  title: string;
  exercises: LocalExercise[];
  isExpanded: boolean;
  isSaving: boolean;
}

export default function EditRoutineScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const { data: routineData } = useRoutine(userId);
  const { mutate: upsertDay } = useUpsertRoutineDay(userId);
  const { mutate: deleteDay } = useDeleteRoutineDay(userId);

  const [exercisePickerDay, setExercisePickerDay] = useState<number | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const { data: exercisesCatalog } = useQuery({
    queryKey: ['exercises-catalog'],
    queryFn: async (): Promise<ExerciseCatalog[]> => {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return (data ?? []) as unknown as ExerciseCatalog[];
    },
  });

  const [days, setDays] = useState<Record<number, DayState>>(() => {
    const initial: Record<number, DayState> = {};
    for (let i = 0; i < 7; i++) {
      const existing = routineData?.[i];
      initial[i] = {
        isRest: existing?.isRest ?? (i === 6),
        title: existing?.title ?? '',
        exercises: (existing?.exercises ?? []).map((ex) => ({
          tempId: ex.id,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exercise.name,
          exerciseEmoji: ex.exercise.emoji,
          sets: String(ex.sets),
          reps: String(ex.reps),
          restSeconds: String(ex.restSeconds),
        })),
        isExpanded: false,
        isSaving: false,
      };
    }
    return initial;
  });

  const updateDay = (dayIndex: number, updates: Partial<DayState>) => {
    setDays((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], ...updates },
    }));
  };

  const toggleExpanded = (dayIndex: number) => {
    updateDay(dayIndex, { isExpanded: !days[dayIndex].isExpanded });
  };

  const addExercise = (dayIndex: number, exercise: ExerciseCatalog) => {
    const newEx: LocalExercise = {
      tempId: `temp-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseEmoji: exercise.emoji,
      sets: '3',
      reps: '10',
      restSeconds: '60',
    };
    updateDay(dayIndex, {
      exercises: [...days[dayIndex].exercises, newEx],
    });
    setShowExercisePicker(false);
    setExercisePickerDay(null);
  };

  const removeExercise = (dayIndex: number, tempId: string) => {
    updateDay(dayIndex, {
      exercises: days[dayIndex].exercises.filter((ex) => ex.tempId !== tempId),
    });
  };

  const updateExerciseField = (
    dayIndex: number,
    tempId: string,
    field: keyof LocalExercise,
    value: string
  ) => {
    updateDay(dayIndex, {
      exercises: days[dayIndex].exercises.map((ex) =>
        ex.tempId === tempId ? { ...ex, [field]: value } : ex
      ),
    });
  };

  const saveDay = (dayIndex: number) => {
    const day = days[dayIndex];
    updateDay(dayIndex, { isSaving: true });

    if (day.isRest) {
      deleteDay(dayIndex, {
        onSuccess: () => updateDay(dayIndex, { isSaving: false }),
        onError: (err) => {
          Alert.alert('Error', (err as Error).message);
          updateDay(dayIndex, { isSaving: false });
        },
      });
    } else {
      upsertDay(
        {
          day_of_week: dayIndex,
          title: day.title || null,
          is_rest: false,
          exercises: day.exercises.map((ex, idx) => ({
            exercise_id: ex.exerciseId,
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 10,
            rest_seconds: Number(ex.restSeconds) || 60,
            sort_order: idx,
          })),
        },
        {
          onSuccess: () => updateDay(dayIndex, { isSaving: false }),
          onError: (err) => {
            Alert.alert('Error', (err as Error).message);
            updateDay(dayIndex, { isSaving: false });
          },
        }
      );
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-border px-4 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft size={24} color="#868685" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Editar Rutina Semanal</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: 7 }).map((_, dayIndex) => {
          const day = days[dayIndex];
          if (!day) return null;
          return (
            <View
              key={dayIndex}
              className="mb-3 overflow-hidden rounded-2xl border border-border bg-secondary"
            >
              {/* Day header */}
              <TouchableOpacity
                onPress={() => toggleExpanded(dayIndex)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">
                    {DAY_NAMES[dayIndex]}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {day.isRest
                      ? 'Descanso'
                      : day.title
                        ? day.title
                        : `${day.exercises.length} ejercicios`}
                  </Text>
                </View>
                {day.isExpanded ? (
                  <ChevronUp size={20} color="#868685" />
                ) : (
                  <ChevronDown size={20} color="#868685" />
                )}
              </TouchableOpacity>

              {day.isExpanded && (
                <View className="border-t border-border px-4 pb-4">
                  {/* Rest toggle */}
                  <View className="mt-4 flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-foreground">Día de descanso</Text>
                    <Switch
                      value={day.isRest}
                      onValueChange={(val) => updateDay(dayIndex, { isRest: val })}
                      trackColor={{ false: '#252720', true: '#9fe870' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {!day.isRest && (
                    <>
                      {/* Title */}
                      <View className="mt-4">
                        <Text className="mb-2 text-sm text-muted-foreground">
                          Nombre del entrenamiento
                        </Text>
                        <TextInput
                          value={day.title}
                          onChangeText={(val) => updateDay(dayIndex, { title: val })}
                          placeholder="Ej: Push Day, Pierna..."
                          placeholderTextColor="#868685"
                          className="rounded-xl border border-border bg-background px-3 py-2 text-foreground"
                        />
                      </View>

                      {/* Exercises list */}
                      {day.exercises.map((ex) => (
                        <View
                          key={ex.tempId}
                          className="mt-3 rounded-xl border border-border bg-background p-3"
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                              {ex.exerciseEmoji ? `${ex.exerciseEmoji} ` : ''}{ex.exerciseName}
                            </Text>
                            <TouchableOpacity
                              onPress={() => removeExercise(dayIndex, ex.tempId)}
                              activeOpacity={0.7}
                            >
                              <Trash2 size={16} color="#d03238" />
                            </TouchableOpacity>
                          </View>
                          <View className="mt-2 flex-row gap-3">
                            <View className="flex-1">
                              <Text className="mb-1 text-xs text-muted-foreground">Series</Text>
                              <TextInput
                                value={ex.sets}
                                onChangeText={(val) =>
                                  updateExerciseField(dayIndex, ex.tempId, 'sets', val)
                                }
                                keyboardType="numeric"
                                className="rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-foreground"
                              />
                            </View>
                            <View className="flex-1">
                              <Text className="mb-1 text-xs text-muted-foreground">Reps</Text>
                              <TextInput
                                value={ex.reps}
                                onChangeText={(val) =>
                                  updateExerciseField(dayIndex, ex.tempId, 'reps', val)
                                }
                                keyboardType="numeric"
                                className="rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-foreground"
                              />
                            </View>
                            <View className="flex-1">
                              <Text className="mb-1 text-xs text-muted-foreground">Descanso (s)</Text>
                              <TextInput
                                value={ex.restSeconds}
                                onChangeText={(val) =>
                                  updateExerciseField(dayIndex, ex.tempId, 'restSeconds', val)
                                }
                                keyboardType="numeric"
                                className="rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-foreground"
                              />
                            </View>
                          </View>
                        </View>
                      ))}

                      {/* Add exercise */}
                      <TouchableOpacity
                        onPress={() => {
                          setExercisePickerDay(dayIndex);
                          setShowExercisePicker(true);
                        }}
                        activeOpacity={0.7}
                        className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3"
                      >
                        <Plus size={16} color="#868685" />
                        <Text className="text-sm text-muted-foreground">Agregar ejercicio</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Save button */}
                  <TouchableOpacity
                    onPress={() => saveDay(dayIndex)}
                    disabled={day.isSaving}
                    activeOpacity={0.85}
                    className="mt-4 items-center rounded-full bg-primary py-3"
                  >
                    {day.isSaving ? (
                      <ActivityIndicator color="#0e0f0c" />
                    ) : (
                      <Text className="font-bold text-primary-foreground">Guardar {DAY_NAMES[dayIndex]}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Exercise Picker Modal */}
      {showExercisePicker && exercisePickerDay !== null && (
        <View
          className="absolute inset-0 bg-foreground/60"
          style={{ justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setShowExercisePicker(false);
              setExercisePickerDay(null);
            }}
            className="flex-1"
          />
          <View className="rounded-t-3xl bg-background pb-8">
            <View className="items-center py-3">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>
            <Text className="mb-4 px-4 text-lg font-bold text-foreground">
              Seleccionar ejercicio
            </Text>
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
              style={{ maxHeight: 400 }}
            >
              {(exercisesCatalog ?? []).map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => addExercise(exercisePickerDay, ex)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3"
                >
                  <Text className="text-lg">{ex.emoji}</Text>
                  <Text className="flex-1 text-sm font-medium text-foreground">{ex.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
