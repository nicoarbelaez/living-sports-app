import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useNotificationStore } from '@/features/notifications/stores/useNotificationStore';
import { formatRelativeEs } from '@/lib/date/formatRelativeEs';

const NOTIFICATION_LABELS: Record<string, string> = {
  new_comment: 'Nuevo comentario en tu post',
  competition_closed: 'Competencia finalizada',
  invite_received: 'Te invitaron a una comunidad',
  evidence_approved: 'Tu evidencia fue avalada ✓',
  evidence_rejected: 'Tu evidencia fue rechazada',
};

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const notification = notifications.find((n) => n.id === id);

  useEffect(() => {
    if (notification && !notification.readAt) {
      markAsRead(notification.id);
    }
  }, [notification, markAsRead]);

  if (!notification) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Notificación no encontrada.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-medium text-primary">Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="h-14 flex-row items-center border-b border-border px-4">
          <Pressable onPress={() => router.back()} className="p-1">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <Text className="ml-3 text-base font-bold text-foreground">
            Detalle de notificación
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-6 items-center">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Bell size={36} className="text-muted-foreground" />
          </View>
        </View>

        <View className="mb-4 rounded-2xl border border-border bg-muted p-5">
          <Text className="mb-1 text-lg font-bold text-foreground">
            {NOTIFICATION_LABELS[notification.type] ?? notification.type}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {formatRelativeEs(notification.createdAt)}
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="rounded-2xl bg-primary py-4 active:opacity-80"
        >
          <Text className="text-center text-base font-bold text-primary-foreground">Volver</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
