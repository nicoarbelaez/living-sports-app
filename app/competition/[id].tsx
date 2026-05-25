import React, { useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Upload, Clock } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAuth } from '@/providers/AuthProvider';
import { useCompetitionDetail } from '@/features/competitions/hooks/useCompetitionDetail';
import { useDeleteCompetition } from '@/features/competitions/hooks/useDeleteCompetition';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import EntryCard from '@/components/competition/EntryCard';
import EvidenceSheet from '@/features/competitions/components/EvidenceSheet';
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

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate + 'T23:59:59');
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const evidenceSheetRef = useRef<BottomSheetModal>(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { competition, entries, loading, voting, canSubmitToday, fetchData, handleVote, handleForceClose } =
    useCompetitionDetail(id, currentUserId);

  const { deleteCompetition, isDeleting } = useDeleteCompetition({
    onSuccess: () => router.back(),
  });

  const isOwner = !!currentUserId && !!competition && currentUserId === competition.createdBy;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!competition) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Competición no encontrada</Text>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[competition.status] ?? STATUS_CONFIG.draft;
  const daysRemaining = competition.status === 'active' ? getDaysRemaining(competition.endDate) : 0;

  const renderEntry = ({ item }: { item: CompetitionEntry }) => (
    <EntryCard
      entry={item}
      isOwn={item.userId === currentUserId}
      isVoting={voting === item.id}
      onVote={async (vote) => {
        try {
          await handleVote(item.id, vote);
        } catch (e) {
          Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo votar');
        }
      }}
    />
  );

  return (
    <View className="flex-1 bg-background">
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

        {competition.status === 'active' && daysRemaining > 0 && (
          <View className="mt-3 flex-row items-center gap-1.5">
            <Clock size={14} color="#f59e0b" />
            <Text className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Termina en {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
        {competition.status === 'active' && daysRemaining === 0 && (
          <View className="mt-3 flex-row items-center gap-1.5">
            <Clock size={14} color="#ef4444" />
            <Text className="text-xs font-semibold text-red-500">Termina hoy</Text>
          </View>
        )}

        {competition.description ? (
          <Text className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {competition.description}
          </Text>
        ) : null}

        {isOwner && competition.status === 'active' && (
          <View className="mt-3 flex-row gap-2">
            <Button
              variant="destructive"
              size="sm"
              onPress={() => setShowCloseDialog(true)}
              className="self-start rounded-full px-4"
            >
              <Text className="text-destructive-foreground text-xs font-semibold">
                Cerrar manualmente
              </Text>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setShowDeleteDialog(true)}
              className="self-start rounded-full px-4"
            >
              <Text className="text-xs font-semibold text-red-500">Eliminar</Text>
            </Button>
          </View>
        )}
      </View>

      <FlashList
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
            onPress={() => evidenceSheetRef.current?.present()}
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

      <EvidenceSheet
        ref={evidenceSheetRef}
        competitionId={competition.id}
        exerciseId={competition.exerciseId}
        onSuccess={fetchData}
      />

      <AlertDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        title="Cerrar competición"
        description="¿Deseas cerrar esta competición manualmente? Esta acción no se puede deshacer."
        confirmLabel="Cerrar"
        destructive
        onConfirm={async () => {
          await handleForceClose();
          setShowCloseDialog(false);
        }}
      />

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar competición"
        description="¿Eliminar esta competición permanentemente? Todos los datos se perderán."
        confirmLabel="Eliminar"
        destructive
        loading={isDeleting}
        onConfirm={() => deleteCompetition(competition.id)}
      />
    </View>
  );
}
