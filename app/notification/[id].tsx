import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Heart,
  MessageCircle,
  CornerDownRight,
  Users,
  UserPlus,
  ArrowLeft,
  Clock,
} from 'lucide-react-native';
import { useNotificationStore } from '@/features/notifications/stores/useNotificationStore';
import type { NotificationType } from '@/types/notification';

// ─── Icon + color map ─────────────────────────────────────────────────────────

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
        label: 'Me gusta',
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
        label: 'Perfil',
      };
  }
}

// ─── Detail text per type ─────────────────────────────────────────────────────

function typeDescription(type: NotificationType): string {
  switch (type) {
    case 'like':
      return 'Le dio me gusta a uno de tus contenidos. Tu publicación está ganando tracción en la comunidad.';
    case 'comment':
      return 'Dejó un comentario en tu publicación. Los comentarios ayudan a construir conversaciones activas.';
    case 'response':
      return 'Respondió a uno de tus comentarios. Mantén el hilo de conversación activo.';
    case 'community':
      return 'Hay actividad nueva en una de tus comunidades. Explora lo que está pasando.';
    case 'profile':
      return 'Interactuó con tu perfil. Revisa tu red de conexiones y crece tu comunidad.';
  }
}

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

  if (!notification) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Notificación no encontrada.
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-medium text-emerald-500">Volver</Text>
        </Pressable>
      </View>
    );
  }

  const { icon: IconComp, bg, color, label } = getIconConfig(notification.type, isDark);

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
          <Text className={`ml-3 text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Detalle de notificación
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Type badge + icon hero */}
        <View className="mb-6 items-center">
          <View
            style={{
              backgroundColor: bg,
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <IconComp size={36} color={color} />
          </View>

          <View
            style={{
              backgroundColor: bg,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text style={{ color, fontWeight: '700', fontSize: 12 }}>{label}</Text>
          </View>
        </View>

        {/* Card */}
        <View
          className={`mb-4 rounded-2xl p-5 ${
            isDark
              ? 'border border-gray-800 bg-gray-900'
              : 'border border-gray-100 bg-white shadow-sm'
          }`}
        >
          {/* Actor */}
          <Text className={`mb-1 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {notification.actorName}
          </Text>

          {/* Body */}
          <Text
            className={`mb-4 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {notification.body}
          </Text>

          {/* Divider */}
          <View className={`mb-4 h-px ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

          {/* Extended description */}
          <Text className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {typeDescription(notification.type)}
          </Text>
        </View>

        {/* Timestamp */}
        <View className="mb-6 flex-row items-center gap-1.5">
          <Clock size={13} color={isDark ? '#6b7280' : '#9ca3af'} />
          <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {notification.timeAgo}
          </Text>
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={() => router.back()}
          className="rounded-2xl bg-emerald-500 py-4 active:opacity-80"
        >
          <Text className="text-center text-base font-bold text-white">
            {notification.type === 'community'
              ? 'Ver comunidad'
              : notification.type === 'profile'
                ? 'Ver perfil'
                : 'Ver publicación'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
