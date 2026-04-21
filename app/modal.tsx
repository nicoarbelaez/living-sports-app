import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ThemeToggle from '@/components/shared/theme-toggle';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/theme';

export default function ModalScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <View className="flex-1 bg-gray-100 px-5 pt-10 dark:bg-black">
      <View className="mb-8 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-white p-2 shadow-sm dark:bg-gray-800"
        >
          <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
        </Pressable>

        <Text className="text-lg font-bold text-black dark:text-white">Configuración</Text>

        <View className="w-8" />
      </View>

      <View className="mt-2">
        <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">APARIENCIA</Text>

        <View className="rounded-2xl bg-gray-200 p-1 dark:bg-gray-900">
          <View className="flex-row items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm dark:bg-gray-800">
            <Text className="text-base text-black dark:text-white">Modo oscuro</Text>

            <ThemeToggle />
          </View>
        </View>
      </View>

      <View className="mt-6">
        <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">CUENTA</Text>

        <View className="rounded-2xl bg-gray-200 p-1 dark:bg-gray-900">
          <Pressable
            onPress={handleSignOut}
            className="rounded-2xl bg-white px-4 py-4 shadow-sm dark:bg-gray-800"
          >
            <Text className="text-base font-semibold text-red-500">Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
