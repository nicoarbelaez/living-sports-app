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

const routines: any = {
  LUN: {
    title: 'Push Day',
    muscles: 'Pecho • Tríceps • Hombro',
    exercises: [
      {
        name: 'Press banca',
        sets: '4x8',
        rest: '90s',
        level: 'hard',
        description: 'Ejercicio compuesto para desarrollar fuerza y masa en el pecho.',
        howTo:
          'Acostado en banco plano, baja la barra controlada al pecho y empuja explosivamente.',
        video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      },
      {
        name: 'Press inclinado',
        sets: '3x10',
        rest: '90s',
        level: 'medium',
        description: 'Enfocado en la parte superior del pecho.',
        howTo: 'Banco inclinado, baja mancuernas hasta el pecho superior y empuja hacia arriba.',
        video: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
      },
      {
        name: 'Fondos',
        sets: '3x12',
        rest: '60s',
        level: 'easy',
        description: 'Trabaja pecho inferior y tríceps con peso corporal.',
        howTo: 'Baja el cuerpo entre barras paralelas y empuja hacia arriba.',
        video: 'https://www.youtube.com/watch?v=6kALZikXxLc',
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
        description: 'Ejercicio clave para espalda y fuerza general.',
        howTo: 'Cuelga de la barra y eleva el cuerpo hasta pasar la barbilla.',
        video: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      },
      {
        name: 'Remo barra',
        sets: '3x10',
        rest: '90s',
        level: 'medium',
        description: 'Desarrolla grosor en la espalda media.',
        howTo: 'Inclina el torso y lleva la barra hacia el abdomen.',
        video: 'https://www.youtube.com/watch?v=vT2GjY_Umpw',
      },
      {
        name: 'Curl bíceps',
        sets: '3x12',
        rest: '60s',
        level: 'easy',
        description: 'Aislamiento para bíceps.',
        howTo: 'Flexiona los codos levantando las mancuernas sin mover hombros.',
        video: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
      },
    ],
  },

  MIE: {
    title: 'Core + Cardio',
    muscles: 'Abdomen • Resistencia',
    exercises: [
      {
        name: 'Crunch abdominal',
        sets: '4x15',
        rest: '45s',
        level: 'easy',
        description: 'Fortalece el abdomen superior.',
        howTo: 'Eleva el torso contrayendo el abdomen sin jalar el cuello.',
        video: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
      },
      {
        name: 'Plancha',
        sets: '4x40s',
        rest: '45s',
        level: 'medium',
        description: 'Ejercicio isométrico de core.',
        howTo: 'Mantén el cuerpo recto apoyado en antebrazos y pies.',
        video: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
      },
      {
        name: 'Mountain climbers',
        sets: '3x30s',
        rest: '30s',
        level: 'hard',
        description: 'Cardio intenso para abdomen y piernas.',
        howTo: 'Alterna rodillas al pecho en posición de plancha.',
        video: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
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
        description: 'Trabajo ligero de pecho con mancuernas.',
        howTo: 'Empuja mancuernas desde el pecho hacia arriba controlado.',
        video: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
      },
      {
        name: 'Elevaciones laterales',
        sets: '3x15',
        rest: '45s',
        level: 'easy',
        description: 'Aislamiento de hombro lateral.',
        howTo: 'Eleva mancuernas lateralmente hasta altura de hombros.',
        video: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
      },
      {
        name: 'Extensión tríceps',
        sets: '3x12',
        rest: '60s',
        level: 'medium',
        description: 'Aislamiento de tríceps.',
        howTo: 'Extiende brazos hacia abajo o arriba según máquina.',
        video: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
      },
    ],
  },

  VIE: {
    title: 'Pull Intenso',
    muscles: 'Espalda • Fuerza',
    exercises: [
      {
        name: 'Peso muerto',
        sets: '4x6',
        rest: '120s',
        level: 'hard',
        description: 'Ejercicio de fuerza total del cuerpo.',
        howTo: 'Levanta la barra desde el suelo manteniendo espalda recta.',
        video: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      },
      {
        name: 'Remo con barra',
        sets: '4x8',
        rest: '90s',
        level: 'hard',
        description: 'Espalda media y fuerza.',
        howTo: 'Tira la barra hacia el abdomen en posición inclinada.',
        video: 'https://www.youtube.com/watch?v=G8l_5R1z0gE',
      },
      {
        name: 'Curl martillo',
        sets: '3x10',
        rest: '60s',
        level: 'medium',
        description: 'Bíceps y antebrazo.',
        howTo: 'Levanta mancuernas con agarre neutro.',
        video: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
      },
    ],
  },

  SAB: {
    title: 'Full Body',
    muscles: 'Cuerpo completo',
    exercises: [
      {
        name: 'Burpees',
        sets: '4x12',
        rest: '60s',
        level: 'hard',
        description: 'Ejercicio cardiovascular completo.',
        howTo: 'Combina flexión, salto y extensión completa.',
        video: 'https://www.youtube.com/watch?v=dZgVxmf6jkA',
      },
      {
        name: 'Sentadilla goblet',
        sets: '3x12',
        rest: '60s',
        level: 'medium',
        description: 'Pierna y core.',
        howTo: 'Sujeta mancuerna y baja en sentadilla profunda.',
        video: 'https://www.youtube.com/watch?v=6xwGFn-J_QA',
      },
      {
        name: 'Flexiones',
        sets: '3x15',
        rest: '45s',
        level: 'easy',
        description: 'Pecho y tríceps con peso corporal.',
        howTo: 'Baja el cuerpo recto y empuja hacia arriba.',
        video: 'https://www.youtube.com/watch?v=_l3ySVKYVJ8',
      },
    ],
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
            className="mt-6 mb-10 items-center rounded-full bg-black py-4 dark:bg-blue-500"
            onPress={() => router.back()}
          >
            <Text className="font-bold text-white dark:text-black">Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL BOTTOM SHEET */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setModalVisible(false)}
        >
          <View className="rounded-t-3xl bg-white p-6 dark:bg-zinc-900">
            <View className="mb-3 h-1 w-12 self-center rounded-full bg-gray-300" />

            <Text className="text-xl font-bold text-black dark:text-white">
              {selectedExercise?.name}
            </Text>

            <Text className="mt-3 text-sm text-gray-500">{selectedExercise?.description}</Text>

            <Text className="mt-4 text-sm font-semibold text-black dark:text-white">
              Cómo hacerlo
            </Text>
            <Text className="mt-1 text-sm text-gray-500">{selectedExercise?.howTo}</Text>

            {selectedExercise?.video && (
              <TouchableOpacity
                className="mt-6 items-center rounded-full bg-blue-600 p-3"
                onPress={() => Linking.openURL(selectedExercise.video)}
              >
                <Text className="text-center font-bold text-white">Ver video demostración</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="mt-6 items-center rounded-full bg-black py-3 dark:bg-white"
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
