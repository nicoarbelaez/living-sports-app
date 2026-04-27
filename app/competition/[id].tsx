import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Upload } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useCompetitionDetail } from '@/features/competitions/hooks/useCompetitionDetail';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import EntryCard from '@/components/competition/EntryCard';
import EvidenceModal from '@/components/competition/EvidenceModal';
import type { CompetitionEntry } from '@/types/competition';

const STATUS_CONFIG: Record<string, { label: string; color: string; text: string }> = {
  draft: {
    label: 'Borrador',
    color: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
  },
  active: {
    label: 'Activa',
    color: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-400',
  },
  finished: {
    label: 'Finalizada',
    color: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-400',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-400',
  },
};

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });
}

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const [showSubmit, setShowSubmit] = useState(false);

  const { competition, entries, loading, voting, canSubmitToday, fetchData, handleVote } =
    useCompetitionDetail(id, currentUserId);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!competition) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-black">
        <Text className="text-black dark:text-white">Competición no encontrada</Text>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[competition.status] ?? STATUS_CONFIG.draft;

  const renderEntry = ({ item }: { item: CompetitionEntry }) => (
    <EntryCard
      entry={item}
      isOwn={item.userId === currentUserId}
      isVoting={voting === item.id}
      onVote={(vote) => handleVote(item.id, vote)}
    />
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <View className="bg-white px-4 pt-14 pb-4 dark:bg-gray-900">
        <View className="mb-3 flex-row items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            icon={<ArrowLeft size={20} />}
            onPress={() => router.back()}
            className="bg-muted rounded-full"
          />
          <Text className="flex-1 text-base font-bold text-black dark:text-white" numberOfLines={1}>
            {competition.title}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/40">
            <Text className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              {competition.exerciseName}
            </Text>
          </View>
          <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              {formatDate(competition.startDate)} – {formatDate(competition.endDate)}
            </Text>
          </View>
          <View className={`rounded-full px-3 py-1 ${statusConfig.color}`}>
            <Text className={`text-xs font-semibold ${statusConfig.text}`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {competition.description ? (
          <Text className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {competition.description}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState emoji="🏋️" title="Sin evidencias aún" subtitle="¡Sé el primero en subir!" />
        }
      />

      {competition.status === 'active' && canSubmitToday && (
        <View className="absolute bottom-8 self-center">
          <Button
            onPress={() => setShowSubmit(true)}
            icon={<Upload size={20} />}
            className="rounded-full px-6 py-4"
            style={{
              shadowColor: '#3b82f6',
              shadowOpacity: 0.5,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            <Text className="text-primary-foreground text-base font-bold">Subir evidencia</Text>
          </Button>
        </View>
      )}

      <EvidenceModal
        visible={showSubmit}
        competition={competition}
        onClose={() => setShowSubmit(false)}
        onSuccess={fetchData}
      />
    </View>
  );
}
