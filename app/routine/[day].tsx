import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useRoutine } from '@/features/profile/hooks/useRoutine';
import { DAY_NAMES } from '@/features/profile/types';
import { Skeleton } from '@/components/ui/skeleton';
import type { RoutineExercise } from '@/features/profile/types';

export default function RoutineScreen() {
  const { day } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const dayIndex = Number(day);
  const { data: routineMap, isLoading } = useRoutine(userId);

  const [selectedExercise, setSelectedExercise] = useState<RoutineExercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const routine = routineMap?.[dayIndex];
  const dayName = DAY_NAMES[dayIndex] ?? `Día ${dayIndex + 1}`;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-4 pt-4">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#868685" />
          </TouchableOpacity>
          <Skeleton className="mt-4 h-8 w-48 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-32 rounded-lg" />
          <View className="mt-8 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!routine || routine.isRest) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center gap-3 px-4 pt-4">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={24} color="#868685" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">{dayName}</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl">😴</Text>
          <Text className="mt-4 text-xl font-bold text-foreground">Día de descanso</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            No hay ejercicios configurados para este día.{'\n'}Recuperación total.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header block */}
        <View className="rounded-b-3xl bg-foreground px-5 pt-14 pb-8">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mb-3">
            <ChevronLeft size={24} color="#9fe870" />
          </TouchableOpacity>
          <Text className="text-xs text-muted-foreground" style={{ color: '#9fe87080' }}>
            {dayName}
          </Text>
          <Text className="mt-1 text-3xl font-extrabold text-primary">
            {routine.title ?? 'Entrenamiento'}
          </Text>
          {routine.description && (
            <Text className="mt-2 text-sm" style={{ color: '#abaead' }}>
              {routine.description}
            </Text>
          )}
          {routine.durationSec && (
            <View className="mt-3 self-start rounded-full bg-primary/20 px-3 py-1">
              <Text className="text-xs font-semibold text-primary">
                {Math.floor(routine.durationSec / 60)} min
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6 px-4">
          <Text className="mb-4 text-lg font-bold text-foreground">
            Ejercicios ({routine.exercises.length})
          </Text>

          {routine.exercises.map((ex, index) => (
            <TouchableOpacity
              key={ex.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedExercise(ex);
                setModalVisible(true);
              }}
              className="mb-4 flex-row items-center rounded-2xl bg-secondary p-4"
            >
              <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-primary">
                <Text className="font-bold text-primary-foreground">{index + 1}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-foreground">
                  {ex.exercise.emoji} {ex.exercise.name}
                </Text>
                <View className="mt-2 flex-row gap-4">
                  <Text className="text-xs text-muted-foreground">
                    {ex.sets} × {ex.reps} reps
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {ex.restSeconds}s descanso
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className="mt-6 mb-10 items-center rounded-full bg-foreground py-4"
            onPress={() => router.back()}
          >
            <Text className="font-bold text-primary">Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exercise detail modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end bg-foreground/50"
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="rounded-t-3xl bg-background p-6">
              <View className="mb-3 h-1 w-12 self-center rounded-full bg-border" />

              <Text className="text-2xl font-bold text-foreground">
                {selectedExercise?.exercise.emoji} {selectedExercise?.exercise.name}
              </Text>

              <View className="mt-4 flex-row gap-3">
                <View className="flex-1 items-center rounded-xl bg-secondary p-3">
                  <Text className="text-lg font-bold text-foreground">
                    {selectedExercise?.sets}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Series</Text>
                </View>
                <View className="flex-1 items-center rounded-xl bg-secondary p-3">
                  <Text className="text-lg font-bold text-foreground">
                    {selectedExercise?.reps}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Reps</Text>
                </View>
                <View className="flex-1 items-center rounded-xl bg-secondary p-3">
                  <Text className="text-lg font-bold text-foreground">
                    {selectedExercise?.restSeconds}s
                  </Text>
                  <Text className="text-xs text-muted-foreground">Descanso</Text>
                </View>
              </View>

              <TouchableOpacity
                className="mt-6 items-center rounded-full bg-foreground py-3"
                onPress={() => setModalVisible(false)}
              >
                <Text className="font-bold text-primary">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </View>
  );
}
