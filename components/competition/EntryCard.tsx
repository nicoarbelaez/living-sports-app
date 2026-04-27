import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Play, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';
import { Button } from '@/components/ui/button';
import type { CompetitionEntry } from '@/types/competition';
import { useTheme } from '@/providers/theme';

const STATUS_CONFIG: Record<string, { label: string; color: string; text: string }> = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  approved: {
    label: 'Aprobada',
    color: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-400',
  },
  rejected: {
    label: 'Rechazada',
    color: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-400',
  },
  resubmitted: {
    label: 'Reenviada',
    color: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-400',
  },
};

interface EntryCardProps {
  entry: CompetitionEntry;
  isOwn: boolean;
  isVoting: boolean;
  onVote: (vote: 'approve' | 'reject') => void;
}

export default function EntryCard({ entry, isOwn, isVoting, onVote }: EntryCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const sc = STATUS_CONFIG[entry.validationStatus] ?? STATUS_CONFIG.pending;
  const canVote = !isOwn && entry.validationStatus === 'pending' && !isVoting;

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-gray-900">
      <View className="mb-3 flex-row items-center gap-3">
        <AvatarWithEmoji
          imageUrl={entry.user?.avatarUrl}
          fallback={entry.user?.username?.[0]?.toUpperCase() ?? '?'}
          size="sm"
        />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-black dark:text-white">
            {entry.user?.username ?? 'Usuario'}
            {isOwn && <Text className="font-normal text-blue-500"> (tú)</Text>}
          </Text>
        </View>
        <View className={`rounded-full px-2 py-0.5 ${sc.color}`}>
          <Text className={`text-xs font-semibold ${sc.text}`}>{sc.label}</Text>
        </View>
      </View>

      <View className="mb-3 h-40 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        <Play size={32} color={isDark ? '#6b7280' : '#9ca3af'} />
        <Text className="mt-1 text-xs text-gray-400">Video de evidencia</Text>
      </View>

      <Text className="mb-1 text-base font-bold text-black dark:text-white">
        Valor: <Text className="text-blue-600">{entry.prValue}</Text>
      </Text>
      {entry.description && (
        <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">{entry.description}</Text>
      )}

      <View className="mb-3 flex-row gap-4">
        <Text className="text-xs text-green-600">✓ {entry.approvalsCount} aprobaciones</Text>
        <Text className="text-xs text-red-500">✗ {entry.rejectionsCount} rechazos</Text>
      </View>

      {canVote && (
        <View className="flex-row gap-3">
          <Button
            variant="success"
            size="sm"
            icon={<ThumbsUp size={16} />}
            onPress={() => onVote('approve')}
            className="flex-1 rounded-xl py-2.5"
          >
            <Text className="text-sm font-semibold text-white">Aprobar</Text>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            icon={<ThumbsDown size={16} />}
            onPress={() => onVote('reject')}
            className="flex-1 rounded-xl py-2.5"
          >
            <Text className="text-sm font-semibold text-white">Rechazar</Text>
          </Button>
        </View>
      )}

      {isVoting && <ActivityIndicator color="#3b82f6" />}
    </View>
  );
}
