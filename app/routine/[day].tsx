import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const routines: any = {
  LUN: {
    title: 'Push Day',
    muscles: 'Pecho • Tríceps • Hombro',
    exercises: [
      { name: 'Press banca', sets: '4x8', rest: '90s' },
      { name: 'Press inclinado', sets: '3x10', rest: '90s' },
      { name: 'Fondos', sets: '3x12', rest: '60s' },
    ],
  },
  MAR: {
    title: 'Pull Day',
    muscles: 'Espalda • Bíceps',
    exercises: [
      { name: 'Dominadas', sets: '4x8', rest: '90s' },
      { name: 'Remo barra', sets: '3x10', rest: '90s' },
      { name: 'Curl bíceps', sets: '3x12', rest: '60s' },
    ],
  },
  MIE: {
    title: 'Leg Day',
    muscles: 'Pierna • Glúteo',
    exercises: [
      { name: 'Sentadilla', sets: '4x8', rest: '120s' },
      { name: 'Prensa', sets: '3x12', rest: '90s' },
      { name: 'Extensiones', sets: '3x15', rest: '60s' },
    ],
  },
};

export default function RoutineScreen() {
  const { day } = useLocalSearchParams();
  const router = useRouter();

  const routine = routines[day as string];

  if (!routine) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-gray-500">No hay rutina para este día</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* HEADER PRO */}
        <View className="mb-6 rounded-3xl bg-blue-600 p-6 shadow-lg">
          <Text className="text-xs text-blue-100">{day}</Text>

          <Text className="mt-1 text-3xl font-extrabold text-white">{routine.title}</Text>

          <Text className="mt-2 text-sm text-blue-100">{routine.muscles}</Text>

          <View className="mt-4 flex-row gap-2">
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-xs text-white">🔥 Intensidad media</Text>
            </View>
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-xs text-white">⏱ 60–90 min</Text>
            </View>
          </View>
        </View>

        {/* TITULO */}
        <Text className="mb-4 text-lg font-bold text-black dark:text-white">Ejercicios</Text>

        {/* LISTA PRO */}
        {routine.exercises.map((ex: any, index: number) => (
          <View
            key={index}
            className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900"
          >
            {/* NUMERO */}
            <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <Text className="font-bold text-white">{index + 1}</Text>
            </View>

            {/* INFO */}
            <View className="flex-1">
              <Text className="text-base font-bold text-black dark:text-white">{ex.name}</Text>

              <View className="mt-2 flex-row gap-4">
                <Text className="text-xs text-gray-500">Series: {ex.sets}</Text>
                <Text className="text-xs text-gray-500">Descanso: {ex.rest}</Text>
              </View>
            </View>

            {/* BADGE */}
            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-zinc-800">
              <Text className="text-xs text-gray-600 dark:text-gray-300">Gym</Text>
            </View>
          </View>
        ))}

        {/* BOTÓN PRO */}
        <TouchableOpacity
          className="mt-6 items-center rounded-full bg-black py-4 dark:bg-white"
          onPress={() => router.back()}
        >
          <Text className="font-bold text-white dark:text-black">Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
