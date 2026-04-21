import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Dumbbell } from 'lucide-react-native';
import { MotiView } from 'moti';
import type { Competition } from '@/types/competition';
import { useTheme } from '@/providers/theme';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Activa', color: 'bg-green-100 dark:bg-green-900/40' },
  draft: { label: 'Borrador', color: 'bg-gray-100 dark:bg-gray-800' },
  finished: { label: 'Finalizada', color: 'bg-blue-100 dark:bg-blue-900/40' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 dark:bg-red-900/40' },
};

const STATUS_TEXT: Record<string, string> = {
  active: 'text-green-700 dark:text-green-400',
  draft: 'text-gray-600 dark:text-gray-400',
  finished: 'text-blue-700 dark:text-blue-400',
  cancelled: 'text-red-700 dark:text-red-400',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function CompetitionCard({ competition }: { competition: Competition }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const status = STATUS_LABELS[competition.status] ?? STATUS_LABELS.draft;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/competition/${competition.id}` as any)}
      className="flex-1"
    >
      <MotiView
        from={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="m-1 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
      >
        <View className={`mb-3 self-start rounded-full px-2 py-0.5 ${status.color}`}>
          <Text className={`text-xs font-semibold ${STATUS_TEXT[competition.status]}`}>
            {status.label}
          </Text>
        </View>

        <Text
          className="mb-2 text-sm leading-tight font-bold text-black dark:text-white"
          numberOfLines={2}
        >
          {competition.title}
        </Text>

        <View className="mb-2 flex-row items-center gap-1">
          <Dumbbell size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {competition.exerciseName}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Calendar size={12} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text className="text-xs text-gray-400">
            {formatDate(competition.startDate)} – {formatDate(competition.endDate)}
          </Text>
        </View>
      </MotiView>
    </TouchableOpacity>
  );
}
