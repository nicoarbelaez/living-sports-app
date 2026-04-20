import React, { useCallback } from 'react';
import { View, Text, FlatList, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Router } from 'expo-router';
import {
  Heart,
  MessageCircle,
  CornerDownRight,
  Users,
  UserPlus,
  ArrowLeft,
  Bell,
  CheckCheck,
} from 'lucide-react-native';
import type { Notification, NotificationType } from '@/types/notification';
import { useNotificationStore } from '@/stores/useNotificationStore';

// ─── Icon map ────────────────────────────────────────────────────────────────

type IconConfig = {
  icon: React.ComponentType<{ size: number; color: string }>;
  bg: string;
  color: string;
};

function getIconConfig(type: NotificationType, isDark: boolean): IconConfig {
  switch (type) {
    case 'like':
      return { icon: Heart, bg: isDark ? '#3f1e1e' : '#fee2e2', color: '#ef4444' };
    case 'comment':
      return { icon: MessageCircle, bg: isDark ? '#1e2f3f' : '#dbeafe', color: '#3b82f6' };
    case 'response':
      return { icon: CornerDownRight, bg: isDark ? '#1e3a2f' : '#d1fae5', color: '#10b981' };
    case 'community':
      return { icon: Users, bg: isDark ? '#2f2a1e' : '#fef9c3', color: '#eab308' };
    case 'profile':
      return { icon: UserPlus, bg: isDark ? '#2e1e3f' : '#ede9fe', color: '#8b5cf6' };
  }
}

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

  const bg_row = !item.read
    ? isDark
      ? 'rgba(16,185,129,0.06)'
      : 'rgba(16,185,129,0.05)'
    : 'transparent';

  return (
    <Pressable
      onPress={handlePress}
      style={{ backgroundColor: bg_row }}
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
        <Text
          className={`text-sm leading-snug font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {item.actorName}{' '}
          <Text className={`font-normal ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {item.body}
          </Text>
        </Text>
        <Text className={`mt-0.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {item.timeAgo}
        </Text>
      </View>

      {/* Unread dot + arrow */}
      <View className="ml-2 flex-row items-center gap-1.5" style={{ flexShrink: 0 }}>
        {!item.read && <View className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />}
      </View>
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

  type Section = { type: 'header'; title: string } | { type: 'item'; notification: Notification };

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
          <View className={`px-4 pt-4 pb-1 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
            <Text
              className={`text-xs font-bold tracking-wide uppercase ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {item.title}
            </Text>
          </View>
        );
      }
      return <NotificationItem item={item.notification} router={router} />;
    },
    [isDark, router]
  );

  const keyExtractor = useCallback(
    (item: Section, index: number) =>
      item.type === 'header' ? `header-${index}` : item.notification.id,
    []
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Header */}
      <SafeAreaView edges={['top']} className={isDark ? 'bg-black' : 'bg-white'}>
        <View
          className={
            isDark
              ? 'h-14 flex-row items-center border-b border-gray-800 px-4'
              : 'h-14 flex-row items-center border-b border-gray-200 bg-white px-4 shadow-sm'
          }
        >
          <Pressable onPress={() => router.back()} className="p-1">
            <ArrowLeft size={22} color={isDark ? '#e5e7eb' : '#374151'} />
          </Pressable>

          <View className="ml-3 flex-1 flex-row items-center">
            <Bell size={18} color={isDark ? '#e5e7eb' : '#374151'} />
            <Text className={`ml-2 text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notificaciones
            </Text>
            {unreadCount > 0 && (
              <View className="ml-2 min-w-5 items-center rounded-full bg-emerald-500 px-1.5 py-0.5">
                <Text className="text-xs font-bold text-white">{unreadCount}</Text>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead} className="flex-row items-center gap-1 p-1">
              <CheckCheck size={18} color="#10b981" />
              <Text className="text-sm font-medium text-emerald-500">Leer todo</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Bell size={48} color={isDark ? '#374151' : '#d1d5db'} />
          <Text className={`text-base ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No tienes notificaciones aún
          </Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => (
            <View className={`mx-4 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
          )}
        />
      )}
    </View>
  );
}
