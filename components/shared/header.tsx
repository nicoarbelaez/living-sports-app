import React, { useState } from 'react';
import { View, Pressable, TextInput, Text, useColorScheme } from 'react-native';
import { Search, Bell, Settings, ArrowLeft, Pencil, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '@/stores/useNotificationStore';

type Props = {
  screen: 'home' | 'comunidades' | 'profile';
};

export default function HeaderActions({ screen }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#e5e7eb' : '#374151';

  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState('');

  const unreadCount = useNotificationStore((s) => s.unreadCount);

  if (searchMode) {
    return (
      <View className="flex-1 flex-row items-center rounded-xl bg-gray-100 px-2 dark:bg-gray-900">
        <Pressable onPress={() => setSearchMode(false)} className="p-2">
          <ArrowLeft size={20} color={iconColor} />
        </Pressable>

        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar..."
          placeholderTextColor="#9ca3af"
          className="flex-1 px-2 text-black dark:text-white"
        />
      </View>
    );
  }

  const BellWithBadge = () => (
    <Pressable onPress={() => router.push('/notifications')} className="relative p-1">
      <Bell size={22} color={iconColor} />
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', lineHeight: 11 }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="flex-row items-center">
      {screen === 'home' && (
        <>
          <Pressable onPress={() => setSearchMode(true)} className="p-1">
            <Search size={22} color={iconColor} />
          </Pressable>

          <View className="w-3" />

          <BellWithBadge />
        </>
      )}

      {screen === 'comunidades' && (
        <>
          <Pressable onPress={() => setSearchMode(true)} className="p-1">
            <Search size={22} color={iconColor} />
          </Pressable>

          <View className="w-3" />

          <BellWithBadge />
        </>
      )}

      {screen === 'profile' && (
        <>
          <View className="flex-1 items-start">
            <Pressable onPress={() => router.push('/create-post')} className="p-1">
              <Plus size={22} color={iconColor} />
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/edit-profile')} className="p-1">
            <Pencil size={22} color={iconColor} />
          </Pressable>

          <View className="w-3" />

          <Pressable onPress={() => router.push('/modal')} className="p-1">
            <Settings size={22} color={iconColor} />
          </Pressable>
        </>
      )}
    </View>
  );
}
