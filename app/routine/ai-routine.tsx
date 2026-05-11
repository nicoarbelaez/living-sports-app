import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function AiRoutineScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState('');

  const generateRoutine = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        'https://ovtxiqrnhbkpkvobpwyd.supabase.co/functions/v1/generate-routine',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal: 'Hipertrofia',
            experience: 'Intermedio',
            days: 5,
            duration: 90,
          }),
        }
      );

      const data = await response.json();

      console.log('STATUS:', response.status);
      console.log('DATA:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error generando rutina');
      }

      setRoutine(data.routine);
    } catch (error) {
      console.log('AI ERROR:', error);
    }

    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="rounded-b-[32px] px-5 pt-16 pb-10">
        <Text className="text-xs text-blue-100">IA</Text>

        <Text className="mt-1 text-3xl font-extrabold text-white">Rutina Inteligente</Text>

        <Text className="mt-2 text-sm text-blue-100">
          Genera entrenamientos personalizados automáticamente
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-5 py-6">
        <TouchableOpacity
          onPress={generateRoutine}
          disabled={loading}
          className="items-center rounded-2xl bg-blue-600 py-4"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-bold text-white">Generar rutina IA</Text>
          )}
        </TouchableOpacity>

        {!!routine && (
          <View className="mt-6 rounded-3xl bg-white p-5 dark:bg-zinc-900">
            <Text className="text-base leading-6 text-black dark:text-white">{routine}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 items-center rounded-full bg-zinc-800 py-4"
        >
          <Text className="font-bold text-white">Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
