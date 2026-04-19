import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

/* ==========================
   RUTINA ALINEADA CON PROFILE
   ========================== */
const routines: any = {
  LUN: {
    title: 'Push Day',
    muscles: 'Pecho • Tríceps • Hombro',
    exercises: [
      {
        name: 'Press Banca',
        sets: '4x8',
        rest: '90s',
        level: 'hard',
        description: 'Ejercicio principal para fuerza de pecho.',
        howTo: 'Acostado en banco plano, baja la barra al pecho y empuja controlado hacia arriba.',
        video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      },
      {
        name: 'Press inclinado',
        sets: '3x10',
        rest: '90s',
        level: 'medium',
        description: 'Enfocado en la parte superior del pecho.',
        howTo: 'Empuja mancuernas en banco inclinado controlando el recorrido.',
        video: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
      },
      {
        name: 'Fondos',
        sets: '3x12',
        rest: '60s',
        level: 'easy',
        description: 'Pecho inferior y tríceps con peso corporal.',
        howTo: 'Baja entre barras paralelas y empuja hacia arriba.',
      },
    ],
  },

  MAR: {
    title: 'Pull Day',
    muscles: 'Espalda • Bíceps',
    exercises: [
      {
        name: 'Dominadas',
        sets: '4x8',
        rest: '90s',
        level: 'hard',
        description: 'Fuerza de espalda y dorsales.',
        howTo: 'Eleva el cuerpo hasta pasar la barbilla sobre la barra.',
      },
      {
        name: 'Remo barra',
        sets: '3x10',
        rest: '90s',
        level: 'medium',
        description: 'Espalda media y grosor muscular.',
        howTo: 'Tira la barra hacia el abdomen con torso inclinado.',
      },
      {
        name: 'Curl bíceps',
        sets: '3x12',
        rest: '60s',
        level: 'easy',
        description: 'Aislamiento de bíceps.',
        howTo: 'Flexiona codos sin mover hombros.',
      },
    ],
  },

  MIE: {
    title: 'Leg Day',
    muscles: 'Pierna • Glúteo',
    exercises: [
      {
        name: 'Sentadilla',
        sets: '4x8',
        rest: '120s',
        level: 'hard',
        description: 'Ejercicio base de pierna y fuerza.',
        howTo: 'Baja con espalda recta hasta 90° y sube empujando talones.',
      },
      {
        name: 'Sentadilla goblet',
        sets: '3x12',
        rest: '60s',
        level: 'medium',
        description: 'Pierna y estabilidad de core.',
        howTo: 'Sujeta mancuerna y baja controlado.',
      },
      {
        name: 'Burpees',
        sets: '3x12',
        rest: '60s',
        level: 'hard',
        description: 'Condicionamiento físico completo.',
        howTo: 'Flexión + salto explosivo.',
      },
    ],
  },

  JUE: {
    title: 'Push Ligero',
    muscles: 'Técnica • Volumen',
    exercises: [
      {
        name: 'Press mancuernas',
        sets: '3x12',
        rest: '60s',
        level: 'easy',
        description: 'Trabajo ligero de pecho.',
        howTo: 'Empuja mancuernas desde el pecho.',
      },
      {
        name: 'Elevaciones laterales',
        sets: '3x15',
        rest: '45s',
        level: 'easy',
        description: 'Hombro lateral.',
        howTo: 'Eleva brazos hasta altura de hombros.',
      },
      {
        name: 'Extensión tríceps',
        sets: '3x12',
        rest: '60s',
        level: 'medium',
        description: 'Aislamiento tríceps.',
        howTo: 'Extiende brazos en polea o mancuerna.',
      },
    ],
  },

  VIE: {
    title: 'Pull Intenso',
    muscles: 'Fuerza • Espalda',
    exercises: [
      {
        name: 'Peso muerto',
        sets: '4x6',
        rest: '120s',
        level: 'hard',
        description: 'Fuerza total del cuerpo.',
        howTo: 'Levanta barra desde el suelo manteniendo espalda neutra.',
      },
      {
        name: 'Remo con barra',
        sets: '4x8',
        rest: '90s',
        level: 'hard',
        description: 'Espalda media y fuerza.',
        howTo: 'Tira barra hacia abdomen.',
      },
      {
        name: 'Curl martillo',
        sets: '3x10',
        rest: '60s',
        level: 'medium',
        description: 'Bíceps y antebrazo.',
        howTo: 'Curl con agarre neutro.',
      },
    ],
  },

  SAB: {
    title: 'Pierna Pro',
    muscles: 'Cuádriceps • Femoral',
    exercises: [
      {
        name: 'Sentadilla pesada',
        sets: '4x6',
        rest: '120s',
        level: 'hard',
        description: 'Fuerza máxima en pierna.',
        howTo: 'Sentadilla profunda controlada.',
      },
      {
        name: 'Zancadas',
        sets: '3x12',
        rest: '60s',
        level: 'medium',
        description: 'Unilateral de pierna.',
        howTo: 'Paso largo y baja rodilla trasera.',
      },
    ],
  },

  DOM: {
    title: 'Descanso',
    muscles: 'Recuperación',
    exercises: [],
  },
};

const difficultyStyles: any = {
  easy: { label: 'Fácil', bg: 'bg-green-100', text: 'text-green-600' },
  medium: { label: 'Intermedio', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  hard: { label: 'Difícil', bg: 'bg-red-100', text: 'text-red-600' },
};

export default function RoutineScreen() {
  const { day } = useLocalSearchParams();
  const router = useRouter();

  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedExercise(ex);
                  setModalVisible(true);
                }}
                className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900"
              >
                <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-blue-600">
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
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            className="mt-6 mb-10 items-center rounded-full bg-black py-4 dark:bg-white"
            onPress={() => router.back()}
          >
            <Text className="font-bold text-white dark:text-black">Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM SHEET MEJORADO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setModalVisible(false)}
        >
          <View className="rounded-t-3xl bg-white p-6 dark:bg-zinc-900">
            <View className="mb-3 h-1 w-12 self-center rounded-full bg-gray-300" />

            <Text className="text-2xl font-bold text-black dark:text-white">
              {selectedExercise?.name}
            </Text>

            <Text className="mt-2 text-xs text-blue-600">{routine.title}</Text>

            <View className="mt-4 rounded-2xl bg-gray-100 p-4 dark:bg-zinc-800">
              <Text className="text-sm font-semibold text-black dark:text-white">Descripción</Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {selectedExercise?.description}
              </Text>
            </View>

            <View className="mt-3 rounded-2xl bg-gray-100 p-4 dark:bg-zinc-800">
              <Text className="text-sm font-semibold text-black dark:text-white">Cómo hacerlo</Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {selectedExercise?.howTo}
              </Text>
            </View>

            {selectedExercise?.video && (
              <TouchableOpacity
                className="mt-6 items-center rounded-full bg-blue-500 py-3 dark:bg-white"
                onPress={() => Linking.openURL(selectedExercise.video)}
              >
                <Text className="font-bold text-white dark:text-black">Ver video demostración</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="mt-4 items-center rounded-full bg-black py-3 dark:bg-blue-500"
              onPress={() => setModalVisible(false)}
            >
              <Text className="font-bold text-white dark:text-black">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
