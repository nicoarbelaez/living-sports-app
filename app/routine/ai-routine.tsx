import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function AiRoutineScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="rounded-b-[32px] px-5 pt-16 pb-10">
        <Text className="text-xs text-blue-100">IA</Text>

        <Text className="mt-1 text-3xl font-extrabold text-white">Rutina Inteligente</Text>

        <Text className="mt-2 text-sm text-blue-100">
          Genera entrenamientos personalizados automáticamente
        </Text>
      </LinearGradient>

      {/* CONTENT */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <Text className="text-center text-xl font-bold text-black dark:text-white">
            🚧 En desarrollo
          </Text>

          <Text className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
            Esta opción se está implementando.
            {'\n'}Muy pronto podrás generar rutinas con IA.
          </Text>
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 w-full items-center rounded-full bg-blue-600 py-4"
        >
          <Text className="font-bold text-white">Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
