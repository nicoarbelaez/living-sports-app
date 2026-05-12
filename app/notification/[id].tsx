import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { useNotificationStore } from '@/stores/useNotificationStore';
import {
  getIconConfig,
  getTypeDescription,
  getCtaLabel,
} from '@/features/notifications/utils/notification-icons';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const notification = notifications.find((n) => n.id === id);

  // Mark as read when the detail opens
  useEffect(() => {
    if (notification && !notification.read) {
      markAsRead(notification.id);
    }
  }, [notification, markAsRead]);

  // ─── Not found state ───────────────────────────────────────────────────────

  if (!notification) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Notificación no encontrada.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-medium">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const { icon: IconComp, bg, color, label } = getIconConfig(notification.type, isDark);

  return (
    <View className="bg-background flex-1">
      {/* Header */}
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="border-border bg-background h-14 flex-row items-center border-b px-4">
          <Pressable onPress={() => router.back()} className="p-1">
            <ArrowLeft size={22} color={isDark ? '#e5e7eb' : '#374151'} />
          </Pressable>
          <Text className="text-foreground ml-3 text-base font-bold">Detalle de notificación</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Type badge + icon hero */}
        <View className="mb-6 items-center">
          <View
            className="mb-3 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: bg }}
          >
            <IconComp size={36} color={color} />
          </View>

          <View className="rounded-full px-3 py-1" style={{ backgroundColor: bg }}>
            <Text style={{ color, fontWeight: '700', fontSize: 12 }}>{label}</Text>
          </View>
        </View>

        {/* Card */}
        <View className="border-border bg-card mb-4 rounded-2xl border p-5">
          {/* Actor */}
          <Text className="text-foreground mb-1 text-lg font-bold">{notification.actorName}</Text>

          {/* Body */}
          <Text className="text-muted-foreground mb-4 text-sm leading-relaxed">
            {notification.body}
          </Text>

          {/* Divider */}
          <View className="bg-border mb-4 h-px" />

          {/* Extended description */}
          <Text className="text-muted-foreground text-sm leading-relaxed">
            {getTypeDescription(notification.type)}
          </Text>
        </View>

        {/* Timestamp */}
        <View className="mb-6 flex-row items-center gap-1.5">
          <Clock size={13} color={isDark ? '#6b7280' : '#9ca3af'} />
          <Text className="text-muted-foreground text-xs">{notification.timeAgo}</Text>
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={() => router.back()}
          className="bg-primary rounded-2xl py-4 active:opacity-80"
        >
          <Text className="text-primary-foreground text-center text-base font-bold">
            {getCtaLabel(notification.type)}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
