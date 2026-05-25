import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/ui/video-player';
import type { CompetitionEntry } from '@/types/competition';
import { getFullName } from '@/features/posts/hooks/useComments';

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
  // Default portrait (9:16) — workout videos are typically recorded vertically
  const [aspectRatio, setAspectRatio] = useState(9 / 16);

  const sc = STATUS_CONFIG[entry.validationStatus] ?? STATUS_CONFIG.pending;
  const canVote = !isOwn && entry.validationStatus === 'pending' && !isVoting;

  return (
    <View className="bg-card mb-4 overflow-hidden rounded-2xl">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-4 pb-3">
        <AvatarWithEmoji
          imageUrl={entry.user?.avatar_url}
          fallback={getFullName(entry.user) ?? 'Usuario'}
          size="sm"
        />
        <View className="flex-1">
          <Text className="text-foreground text-sm font-semibold">
            {getFullName(entry.user) ?? 'Usuario'}
            {isOwn && <Text className="text-primary font-normal"> (tú)</Text>}
          </Text>
        </View>
        <View className={`rounded-full px-2 py-0.5 ${sc.color}`}>
          <Text className={`text-xs font-semibold ${sc.text}`}>{sc.label}</Text>
        </View>
      </View>

      {/* Video — container height adapts once real aspect ratio is known */}
      <View style={{ aspectRatio }} className="bg-muted w-full">
        <VideoPlayer
          uri={entry.videoUrl}
          autoPlay={false}
          contentFit="contain"
          onAspectRatioChange={setAspectRatio}
        />
      </View>

      {/* Info */}
      <View className="gap-1 px-4 py-3">
        <Text className="text-foreground text-base font-bold">
          Valor: <Text className="text-primary">{entry.prValue}</Text>
        </Text>
        {entry.description && (
          <Text className="text-muted-foreground text-sm">{entry.description}</Text>
        )}
        <View className="mt-1 flex-row gap-4">
          <Text className="text-positive text-xs">✓ {entry.approvalsCount} aprobaciones</Text>
          <Text className="text-destructive text-xs">✗ {entry.rejectionsCount} rechazos</Text>
        </View>
      </View>

      {/* Actions */}
      {(canVote || isVoting) && (
        <View className="px-4 pb-4">
          {isVoting ? (
            <ActivityIndicator color="#9fe870" />
          ) : (
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
        </View>
      )}
    </View>
  );
}
