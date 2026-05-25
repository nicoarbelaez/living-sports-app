import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useNotificationStore } from '@/features/notifications/stores/useNotificationStore';
import { useNotificationsRealtime } from '@/features/notifications/hooks/useNotificationsRealtime';
import { formatRelativeEs } from '@/lib/date/formatRelativeEs';
import { Skeleton } from '@/components/ui/skeleton';

const NOTIFICATION_LABELS: Record<string, string> = {
  new_comment: 'Nuevo comentario en tu post',
  competition_closed: 'Competencia finalizada',
  invite_received: 'Te invitaron a una comunidad',
  evidence_approved: 'Tu evidencia fue avalada ✓',
  evidence_rejected: 'Tu evidencia fue rechazada',
};

export default function NotificationsScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const router = useRouter();
  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();

  useNotificationsRealtime(userId);

  useEffect(() => {
    if (userId) fetchNotifications(userId);
    // fetchNotifications is stable (Zustand action)
  }, [userId, fetchNotifications]);

  const handlePress = useCallback(
    async (notificationId: string, type: string, payload: Record<string, unknown>) => {
      await markAsRead(notificationId);
      switch (type) {
        case 'new_comment':
          if (payload.post_id) router.push('/');
          break;
        case 'competition_closed':
        case 'evidence_approved':
        case 'evidence_rejected':
          if (payload.competition_id) router.push(`/competition/${payload.competition_id}` as never);
          break;
        case 'invite_received':
          if (payload.token) router.push(`/community/invite/${payload.token}` as never);
          break;
      }
    },
    [markAsRead, router]
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background px-4 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-3 h-16 w-full rounded-xl" />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => userId && fetchNotifications(userId)}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-muted-foreground">Sin notificaciones</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item.id, item.type, item.payload)}
            className={`border-b border-border px-4 py-3 ${!item.readAt ? 'bg-accent/20' : 'bg-background'}`}
          >
            <Text className="font-semibold text-foreground">
              {NOTIFICATION_LABELS[item.type] ?? item.type}
            </Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {formatRelativeEs(item.createdAt)}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
