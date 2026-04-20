import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';

export default function CreateCompetitionCard({ groupId }: { groupId: string }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/competition/create?groupId=${groupId}` as any)}
      className="flex-1"
    >
      <View className="m-1 min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <View className="mb-2 rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
          <Plus size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
        </View>
        <Text className="text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
          Nueva{'\n'}competición
        </Text>
      </View>
    </TouchableOpacity>
  );
}
