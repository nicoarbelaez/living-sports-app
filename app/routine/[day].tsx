import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const routines: any = {
  LUN: {
    title: 'Push Day',
    muscles: 'Pecho • Tríceps • Hombro',
    exercises: [
      { name: 'Press banca', sets: '4x8', rest: '90s', level: 'hard' },
      { name: 'Press inclinado', sets: '3x10', rest: '90s', level: 'medium' },
      { name: 'Fondos', sets: '3x12', rest: '60s', level: 'easy' },
    ],
  },
  MAR: {
    title: 'Pull Day',
    muscles: 'Espalda • Bíceps',
    exercises: [
      { name: 'Dominadas', sets: '4x8', rest: '90s', level: 'hard' },
      { name: 'Remo barra', sets: '3x10', rest: '90s', level: 'medium' },
      { name: 'Curl bíceps', sets: '3x12', rest: '60s', level: 'easy' },
    ],
  },
  MIE: {
    title: 'Leg Day',
    muscles: 'Pierna • Glúteo',
    exercises: [
      { name: 'Sentadilla', sets: '4x8', rest: '120s', level: 'hard' },
      { name: 'Prensa', sets: '3x12', rest: '90s', level: 'medium' },
      { name: 'Extensiones', sets: '3x15', rest: '60s', level: 'easy' },
    ],
  },
  JUE: {
    title: 'Push Ligero',
    muscles: 'Técnica • Volumen',
    exercises: [
      { name: 'Press mancuernas', sets: '3x12', rest: '60s', level: 'easy' },
      { name: 'Elevaciones laterales', sets: '3x15', rest: '45s', level: 'easy' },
      { name: 'Extensión tríceps', sets: '3x12', rest: '60s', level: 'medium' },
    ],
  },
  VIE: {
    title: 'Pull Intenso',
    muscles: 'Espalda • Fuerza',
    exercises: [
      { name: 'Peso muerto', sets: '4x6', rest: '120s', level: 'hard' },
      { name: 'Remo con barra', sets: '4x8', rest: '90s', level: 'hard' },
      { name: 'Curl martillo', sets: '3x10', rest: '60s', level: 'medium' },
    ],
  },
  SAB: {
    title: 'Pierna Pro',
    muscles: 'Cuádriceps • Femoral',
    exercises: [
      { name: 'Sentadilla frontal', sets: '4x8', rest: '120s', level: 'hard' },
      { name: 'Curl femoral', sets: '3x12', rest: '90s', level: 'medium' },
      { name: 'Pantorrilla', sets: '4x15', rest: '60s', level: 'easy' },
    ],
  },
  DOM: {
    title: 'Descanso',
    muscles: 'Recuperación total',
    restDay: true,
  },
};

const difficultyStyles: any = {
  easy: {
    label: 'Fácil',
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  medium: {
    label: 'Intermedio',
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
  hard: {
    label: 'Difícil',
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
};

export default function RoutineScreen() {
  const { day } = useLocalSearchParams();
  const router = useRouter();

  const routine = routines[day as string];

  if (!routine) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-gray-500">No hay rutina para este día</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          className="rounded-b-[32px] px-5 pt-16 pb-8"
        >
          <Text className="text-xs text-blue-100">{day}</Text>

          <Text className="mt-1 text-3xl font-extrabold text-white">{routine.title}</Text>

          <Text className="mt-2 text-sm text-blue-100">{routine.muscles}</Text>
        </LinearGradient>

        <View className="mt-6 px-4">
          <Text className="mb-4 text-lg font-bold text-black dark:text-white">Ejercicios</Text>

          {routine.exercises.map((ex: any, index: number) => {
            const diff = difficultyStyles[ex.level];

            return (
              <View
                key={index}
                className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900"
              >
                <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-blue-600 shadow">
                  <Text className="font-bold text-white">{index + 1}</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-black dark:text-white">{ex.name}</Text>

                  <View className="mt-2 flex-row gap-4">
                    <Text className="text-xs text-gray-500">{ex.sets}</Text>
                    <Text className="text-xs text-gray-500">{ex.rest}</Text>
                  </View>
                </View>

                <View className={`rounded-full px-3 py-1 ${diff.bg}`}>
                  <Text className={`text-xs font-semibold ${diff.text}`}>{diff.label}</Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            className="mt-6 mb-10 items-center rounded-full bg-black py-4 shadow-lg dark:bg-white"
            onPress={() => router.back()}
          >
            <Text className="font-bold text-white dark:text-black">Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
