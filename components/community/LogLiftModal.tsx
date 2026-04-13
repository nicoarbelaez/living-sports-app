import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { EXERCISES, Exercise, Lift } from '@/types/lift';

interface Props {
  visible: boolean;
  communityId: string;
  onClose: () => void;
  onSubmit: (lift: Lift) => void;
}

const MY_AVATAR = 'https://avatars.githubusercontent.com/u/111522939?v=4';

export default function LogLiftModal({ visible, communityId, onClose, onSubmit }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES[0]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [reps, setReps] = useState('');

  const canSubmit =
    weightKg.trim() !== '' && reps.trim() !== '' && Number(weightKg) > 0 && Number(reps) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const lift: Lift = {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'Tú',
      avatarUrl: MY_AVATAR,
      exerciseId: selectedExercise.id,
      weightKg: Number(weightKg),
      reps: Number(reps),
      createdAt: new Date().toISOString(),
    };
    onSubmit(lift);
    setWeightKg('');
    setReps('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        className="bg-gray-100 dark:bg-black"
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header del modal */}
          <View className="mb-8 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-black text-black dark:text-white">
                Registrar Marca
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Compite con tu comunidad 🏆
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800"
            >
              <X size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {/* Selector de ejercicio */}
          <View className="mb-6">
            <Text className="mb-2 font-bold text-black dark:text-white">Ejercicio</Text>
            <TouchableOpacity
              onPress={() => setShowExercisePicker(!showExercisePicker)}
              className="h-14 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <Text className="text-base font-medium text-black dark:text-white">
                {selectedExercise.emoji} {selectedExercise.name}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>

            {showExercisePicker && (
              <View className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                {EXERCISES.map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => {
                      setSelectedExercise(ex);
                      setShowExercisePicker(false);
                    }}
                    className={`flex-row items-center border-b border-gray-100 px-4 py-3.5 dark:border-gray-800 ${selectedExercise.id === ex.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                  >
                    <Text className="mr-3 text-lg">{ex.emoji}</Text>
                    <Text
                      className={`text-base font-medium ${selectedExercise.id === ex.id ? 'text-blue-600 dark:text-blue-400' : 'text-black dark:text-white'}`}
                    >
                      {ex.name}
                    </Text>
                    {selectedExercise.id === ex.id && (
                      <Text className="ml-auto font-bold text-blue-500">✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Inputs de peso y reps */}
          <View className="mb-8 flex-row gap-4">
            <View className="flex-1">
              <Text className="mb-2 font-bold text-black dark:text-white">Peso máximo</Text>
              <View className="h-14 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="flex-1 text-xl font-bold text-black dark:text-white"
                />
                <Text className="font-semibold text-gray-400">kg</Text>
              </View>
            </View>

            <View className="flex-1">
              <Text className="mb-2 font-bold text-black dark:text-white">Repeticiones</Text>
              <View className="h-14 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="flex-1 text-xl font-bold text-black dark:text-white"
                />
                <Text className="font-semibold text-gray-400">reps</Text>
              </View>
            </View>
          </View>

          {/* Botón de publicar */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5 }}
            className="h-14 items-center justify-center rounded-2xl bg-blue-500 shadow-lg"
          >
            <Text className="text-lg font-black text-white">🏆 Publicar Marca</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
