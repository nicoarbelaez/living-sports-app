import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';

export type ExerciseDetails = {
  id: string;
  name: string;
  muscle: string;
  image: string;
  pr: string;
  description?: string;
  type?: string;
};

interface ExerciseModalProps {
  exercise: ExerciseDetails | null;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={exercise !== null}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="rounded-t-3xl bg-white p-6 dark:bg-zinc-900">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-black dark:text-white">{exercise?.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <View className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-800">
                <Text className="font-bold text-gray-800 dark:text-gray-200">X</Text>
              </View>
            </TouchableOpacity>
          </View>

          {exercise?.image && (
            <Image source={{ uri: exercise.image }} className="mb-4 h-48 w-full rounded-2xl" />
          )}

          <View className="mb-4 flex-row flex-wrap gap-2">
            <View className="rounded-lg bg-blue-100 px-3 py-1 dark:bg-blue-900/30">
              <Text className="font-semibold text-blue-700 dark:text-blue-400">
                Músculo: {exercise?.muscle}
              </Text>
            </View>
            {exercise?.type && (
              <View className="rounded-lg bg-purple-100 px-3 py-1 dark:bg-purple-900/30">
                <Text className="font-semibold text-purple-700 dark:text-purple-400">
                  {exercise.type}
                </Text>
              </View>
            )}
            <View className="rounded-lg bg-green-100 px-3 py-1 dark:bg-green-900/30">
              <Text className="font-semibold text-green-700 dark:text-green-400">
                PR: {exercise?.pr}
              </Text>
            </View>
          </View>

          {exercise?.description && (
            <Text className="mb-6 text-base text-gray-700 dark:text-gray-300">
              {exercise.description}
            </Text>
          )}

          <TouchableOpacity onPress={onClose}>
            <View className="items-center rounded-full bg-blue-600 py-4">
              <Text className="font-bold text-white">Cerrar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
