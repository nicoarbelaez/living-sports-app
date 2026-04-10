import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ThemeToggle from '@/components/theme-toggle';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-6 dark:bg-black">
      <View className="mb-3 items-center">
        <View className="h-1.5 w-10 rounded-full bg-gray-400 opacity-60" />
      </View>

      <View className="mb-6 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} color="#3B82F6" />
        </Pressable>

        <View className="absolute right-0 left-0 items-center">
          <Text className="text-lg font-semibold text-black dark:text-white">Configuración</Text>
        </View>

        <View className="w-8" />
      </View>

      <View className="mt-2">
        <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">APARIENCIA</Text>

        <View className="rounded-2xl bg-gray-200 p-1 dark:bg-gray-900">
          <View className="flex-row items-center justify-between rounded-2xl bg-white px-4 py-4 dark:bg-gray-800">
            <Text className="text-base text-black dark:text-white">Modo oscuro</Text>

            <ThemeToggle />
          </View>
        </View>
      </View>
    </View>
  );
}
