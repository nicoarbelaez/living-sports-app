import React, { useCallback } from 'react';
import { View, Text, FlatList, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Router } from 'expo-router';
import { Image } from 'expo-image';
import {
  Heart,
  MessageCircle,
  CornerDownRight,
  Users,
  UserPlus,
  ArrowLeft,
  Bell,
  CheckCheck,
  ChevronRight,
} from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';
import type { Notification, NotificationType } from '@/types/notification';
import { useNotificationStore } from '@/stores/useNotificationStore';

// ─── Icon / colour config ─────────────────────────────────────────────────────

type IconConfig = {
  icon: React.ComponentType<{ size: number; color: string }>;
  bg: string;
  color: string;
  label: string;
};

function getIconConfig(type: NotificationType, isDark: boolean): IconConfig {
  switch (type) {
    case 'like':
      return {
        icon: Heart,
        bg: isDark ? '#3f1e1e' : '#fee2e2',
        color: '#ef4444',
        label: 'Like',
      };
    case 'comment':
      return {
        icon: MessageCircle,
        bg: isDark ? '#1e2f3f' : '#dbeafe',
        color: '#3b82f6',
        label: 'Comentario',
      };
    case 'response':
      return {
        icon: CornerDownRight,
        bg: isDark ? '#1e3a2f' : '#d1fae5',
        color: '#10b981',
        label: 'Respuesta',
      };
    case 'community':
      return {
        icon: Users,
        bg: isDark ? '#2f2a1e' : '#fef9c3',
        color: '#eab308',
        label: 'Comunidad',
      };
    case 'profile':
      return {
        icon: UserPlus,
        bg: isDark ? '#2e1e3f' : '#ede9fe',
        color: '#8b5cf6',
        label: 'Seguidor',
      };
  }
}

// ─── Smart navigation helper ──────────────────────────────────────────────────

function navigateFromNotification(notification: Notification, router: Router) {
  switch (notification.type) {
    case 'like':
    case 'comment':
    case 'response':
      if (notification.postId) {
        router.push(`/notification/${notification.id}` as never);
      }
      break;
    case 'community':
      if (notification.communityId) {
        // Navigate to community detail — adjust path if your route differs
        router.push(`/community/${notification.communityId}` as never);
      } else {
        router.push('/(tabs)/comunidades' as never);
      }
      break;
    case 'profile':
      if (notification.actorId) {
        // Navigate to user profile detail — adjust path if your route differs
        router.push(`/user/${notification.actorId}` as never);
      } else {
        router.push('/(tabs)/profile' as never);
      }
      break;
  }
}

// ─── Pulsing unread dot ───────────────────────────────────────────────────────

function UnreadPulse() {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <MotiView
        from={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ type: 'timing', duration: 1200, loop: true }}
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#10b981',
        }}
      />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
    </View>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotificationItem({
  item,
  router,
  index,
}: {
  item: Notification;
  router: Router;
  index: number;
}) {
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { icon: IconComp, bg, color, label } = getIconConfig(item.type, isDark);

  const handlePress = useCallback(() => {
    markAsRead(item.id);
    navigateFromNotification(item, router);
  }, [markAsRead, item, router]);

  const rowBg = !item.read
    ? isDark
      ? 'rgba(16,185,129,0.07)'
      : 'rgba(16,185,129,0.05)'
    : 'transparent';

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 320, delay: index * 50 }}
    >
      <Pressable
        onPress={handlePress}
        style={{ backgroundColor: rowBg }}
        className="flex-row items-center px-4 py-3.5 active:opacity-60"
      >
        {/* Left: Avatar + icon badge */}
        <View style={{ position: 'relative', width: 50, height: 50 }}>
          {item.actorAvatar ? (
            <Image
              source={{ uri: item.actorAvatar }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>{item.actorName.charAt(0)}</Text>
            </View>
          )}
          {/* Type badge */}
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -4,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: bg,
              borderWidth: 2,
              borderColor: isDark ? '#000' : '#fff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconComp size={11} color={color} />
          </View>
        </View>

        {/* Middle: Text */}
        <View className="ml-3 flex-1">
          {/* Pill label */}
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: bg,
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 1,
              marginBottom: 3,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color, letterSpacing: 0.3 }}>
              {label.toUpperCase()}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              color: isDark ? '#f3f4f6' : '#111827',
              fontWeight: item.read ? '400' : '600',
            }}
            numberOfLines={2}
          >
            <Text style={{ fontWeight: '700' }}>{item.actorName}</Text>
            {'  '}
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '400' }}>
              {item.body}
            </Text>
          </Text>

          <Text
            style={{
              marginTop: 3,
              fontSize: 11,
              color: isDark ? '#6b7280' : '#9ca3af',
            }}
          >
            {item.timeAgo}
          </Text>
        </View>

        {/* Right: Unread dot + chevron */}
        <View className="ml-2 items-center gap-1.5" style={{ flexShrink: 0 }}>
          {!item.read && <UnreadPulse />}
          <ChevronRight size={14} color={isDark ? '#374151' : '#d1d5db'} />
        </View>
      </Pressable>
    </MotiView>
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

  type Section =
    | { type: 'header'; title: string }
    | { type: 'item'; notification: Notification; index: number };

  let idx = 0;

  const listData: Section[] = [
    ...(unread.length > 0
      ? [
          { type: 'header' as const, title: `Sin leer · ${unread.length}` },
          ...unread.map((n) => ({
            type: 'item' as const,
            notification: n,
            index: idx++,
          })),
        ]
      : []),
    ...(read.length > 0
      ? [
          { type: 'header' as const, title: 'Anteriores' },
          ...read.map((n) => ({
            type: 'item' as const,
            notification: n,
            index: idx++,
          })),
        ]
      : []),
  ];

  const renderItem = useCallback(
    ({ item }: { item: Section }) => {
      if (item.type === 'header') {
        return (
          <View className={`px-4 pt-5 pb-2 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.8,
                color: isDark ? '#6b7280' : '#9ca3af',
                textTransform: 'uppercase',
              }}
            >
              {item.title}
            </Text>
          </View>
        );
      }
      return <NotificationItem item={item.notification} router={router} index={item.index} />;
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
      {/* ── Header ── */}
      <SafeAreaView edges={['top']} className={isDark ? 'bg-black' : 'bg-white'}>
        <View
          className={
            isDark
              ? 'h-14 flex-row items-center border-b border-gray-800 px-4'
              : 'h-14 flex-row items-center border-b border-gray-200 bg-white px-4 shadow-sm'
          }
        >
          <Pressable onPress={() => router.back()} className="p-1 active:opacity-60">
            <ArrowLeft size={22} color={isDark ? '#e5e7eb' : '#374151'} />
          </Pressable>

          <View className="ml-3 flex-1 flex-row items-center gap-2">
            {/* Animated bell */}
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: unreadCount > 0 ? '10deg' : '0deg' }}
              transition={{ type: 'spring', loop: unreadCount > 0 }}
            >
              <Bell size={18} color={isDark ? '#e5e7eb' : '#374151'} />
            </MotiView>

            <MotiText
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isDark ? '#fff' : '#111827',
              }}
            >
              Notificaciones
            </MotiText>

            {unreadCount > 0 && (
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                style={{
                  minWidth: 20,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 10,
                  backgroundColor: '#ef4444',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                  {unreadCount}
                </Text>
              </MotiView>
            )}
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={markAllAsRead}
              className="flex-row items-center gap-1 rounded-full px-3 py-1.5 active:opacity-60"
              style={{ backgroundColor: isDark ? '#1f2937' : '#f0fdf4' }}
            >
              <CheckCheck size={14} color="#10b981" />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#10b981' }}>Leer todo</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      {/* ── Empty state ── */}
      {notifications.length === 0 ? (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="flex-1 items-center justify-center gap-4"
        >
          <MotiView
            from={{ rotate: '-10deg' }}
            animate={{ rotate: '10deg' }}
            transition={{ type: 'timing', duration: 800, loop: true }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={36} color={isDark ? '#374151' : '#d1d5db'} />
          </MotiView>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: isDark ? '#6b7280' : '#9ca3af',
            }}
          >
            No tienes notificaciones aún
          </Text>
        </MotiView>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                marginHorizontal: 16,
                height: 0.5,
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
              }}
            />
          )}
        />
      )}
    </View>
  );
}
