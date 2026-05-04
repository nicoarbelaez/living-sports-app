import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';

export default function CreateCommunityButton() {
  const router = useRouter();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 100 }}
      className="w-full"
    >
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/create-community')}>
        <View className="flex-row items-center rounded-2xl border border-dashed border-blue-500 bg-white px-6 py-4 dark:bg-gray-900">
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-500">
            <Plus size={20} color="#09090b" className="font-bold" />
          </View>
          <View>
            <Text className="text-lg font-bold text-black dark:text-white">Crear comunidad</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Empieza tu propio grupo
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}
