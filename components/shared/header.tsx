import React, { useMemo, useState } from 'react';

import { View, Pressable, TextInput, Text, useColorScheme } from 'react-native';

import { Search, Bell, Settings, ArrowLeft, Pencil } from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { useNotificationStore } from '@/features/notifications/stores/useNotificationStore';

type Props = {
  screen: 'home' | 'comunidades' | 'profile';
};

export default function HeaderActions({ screen }: Props) {
  const router = useRouter();

  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  const [searchMode, setSearchMode] = useState(false);

  const [query, setQuery] = useState('');

  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const colors = useMemo(
    () => ({
      icon: isDark ? '#f5f5f5' : '#18181b',

      muted: isDark ? '#a1a1aa' : '#71717a',

      searchBg: isDark ? '#1a1a1a' : '#f4f4f5',

      card: isDark ? '#111111' : '#ffffff',

      border: isDark ? '#27272a' : '#e4e4e7',

      badge: '#9fe870',

      badgeText: '#0e0f0c',
    }),
    [isDark]
  );

  if (searchMode) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} animated />

        <View
          style={{
            backgroundColor: colors.searchBg,
            borderColor: colors.border,
          }}
          className="flex-1 flex-row items-center rounded-2xl border px-2"
        >
          <Pressable onPress={() => setSearchMode(false)} className="p-2">
            <ArrowLeft size={20} color={colors.icon} />
          </Pressable>

          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar..."
            placeholderTextColor={colors.muted}
            cursorColor="#9fe870"
            selectionColor="#9fe870"
            className="text-foreground flex-1 px-2"
          />
        </View>
      </>
    );
  }

  const BellWithBadge = () => (
    <Pressable
      onPress={() => router.push('/notifications')}
      className="relative rounded-full p-2"
      style={{
        backgroundColor: isDark ? '#18181b' : '#f4f4f5',
      }}
    >
      <Bell size={20} color={colors.icon} />

      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,

            minWidth: 18,
            height: 18,

            borderRadius: 999,

            backgroundColor: colors.badge,

            alignItems: 'center',
            justifyContent: 'center',

            paddingHorizontal: 4,

            borderWidth: 2,

            borderColor: colors.card,
          }}
        >
          <Text
            style={{
              color: colors.badgeText,
              fontSize: 10,
              fontWeight: '800',
              lineHeight: 12,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );

  const IconButton = ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className="rounded-full p-2"
      style={{
        backgroundColor: isDark ? '#18181b' : '#f4f4f5',
      }}
    >
      {children}
    </Pressable>
  );

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} animated />

      <View className="flex-row items-center gap-2">
        {(screen === 'home' || screen === 'comunidades') && (
          <>
            <IconButton onPress={() => setSearchMode(true)}>
              <Search size={20} color={colors.icon} />
            </IconButton>

            <BellWithBadge />
          </>
        )}

        {screen === 'profile' && (
          <>
            <IconButton onPress={() => router.push('/edit-profile')}>
              <Pencil size={20} color={colors.icon} />
            </IconButton>

            <IconButton onPress={() => router.push('/modal')}>
              <Settings size={20} color={colors.icon} />
            </IconButton>
          </>
        )}
      </View>
    </>
  );
}
