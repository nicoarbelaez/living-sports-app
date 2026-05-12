import React, { useCallback } from 'react';
import { View, Text, FlatList, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Router } from 'expo-router';
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react-native';
import type { Notification } from '@/types/notification';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { getIconConfig } from '@/features/notifications/utils/notification-icons';

// ─── Section type ─────────────────────────────────────────────────────────────

type Section = { type: 'header'; title: string } | { type: 'item'; notification: Notification };

// ─── Notification row ─────────────────────────────────────────────────────────

function NotificationItem({ item, router }: { item: Notification; router: Router }) {
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { icon: IconComp, bg, color } = getIconConfig(item.type, isDark);

  const handlePress = useCallback(() => {
    markAsRead(item.id);
    router.push(`/notification/${item.id}` as never);
  }, [markAsRead, item.id, router]);

  return (
    <Pressable
      onPress={handlePress}
      style={
        !item.read
          ? { backgroundColor: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.05)' }
          : undefined
      }
      className="flex-row items-start px-4 py-3 active:opacity-70"
    >
      {/* Icon chip */}
      <View
        style={{ backgroundColor: bg, width: 44, height: 44, borderRadius: 22 }}
        className="items-center justify-center"
      >
        <IconComp size={20} color={color} />
      </View>

      {/* Text block */}
      <View className="ml-3 flex-1">
        <Text className="text-foreground text-sm leading-snug font-semibold">
          {item.actorName} <Text className="text-muted-foreground font-normal">{item.body}</Text>
        </Text>
        <Text className="text-muted-foreground mt-0.5 text-xs">{item.timeAgo}</Text>
      </View>

      {/* Unread dot */}
      {!item.read && (
        <View className="bg-primary mt-1.5 ml-2 h-2 w-2 rounded-full" style={{ flexShrink: 0 }} />
      )}
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const listData: Section[] = [
    ...(unread.length > 0
      ? [
          { type: 'header' as const, title: 'Sin leer' },
          ...unread.map((n) => ({ type: 'item' as const, notification: n })),
        ]
      : []),
    ...(read.length > 0
      ? [
          { type: 'header' as const, title: 'Anteriores' },
          ...read.map((n) => ({ type: 'item' as const, notification: n })),
        ]
      : []),
  ];

  const renderItem = useCallback(
    ({ item }: { item: Section }) => {
      if (item.type === 'header') {
        return (
          <View className="bg-background px-4 pt-4 pb-1">
            <Text className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
              {item.title}
            </Text>
          </View>
        );
      }
      return <NotificationItem item={item.notification} router={router} />;
    },
    [router]
  );

  const keyExtractor = useCallback(
    (item: Section, index: number) =>
      item.type === 'header' ? `header-${index}` : item.notification.id,
    []
  );

  return (
    <View className="bg-background flex-1">
      {/* Header */}
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="border-border bg-background h-14 flex-row items-center border-b px-4">
          <Pressable onPress={() => router.back()} className="p-1">
            <ArrowLeft size={22} color={isDark ? '#e5e7eb' : '#374151'} />
          </Pressable>

          <View className="ml-3 flex-1 flex-row items-center">
            <Bell size={18} color={isDark ? '#e5e7eb' : '#374151'} />
            <Text className="text-foreground ml-2 text-base font-bold">Notificaciones</Text>

            {unreadCount > 0 && (
              <View className="bg-primary ml-2 min-w-5 items-center rounded-full px-1.5 py-0.5">
                <Text className="text-primary-foreground text-xs font-bold">{unreadCount}</Text>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead} className="flex-row items-center gap-1 p-1">
              <CheckCheck size={18} color="#10b981" />
              <Text className="text-primary text-sm font-medium">Leer todo</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Bell size={48} color={isDark ? '#374151' : '#d1d5db'} />
          <Text className="text-muted-foreground text-base">No tienes notificaciones aún</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="bg-border mx-4 h-px" />}
        />
      )}
    </View>
  );
}
