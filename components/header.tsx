import React, { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Search, Bell, Settings, ArrowLeft, Pencil, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Props = {
  screen: 'home' | 'comunidades' | 'profile';
};

export default function HeaderActions({ screen }: Props) {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState('');

  if (searchMode) {
    return (
      <View className="flex-1 flex-row items-center rounded-xl bg-gray-100 px-2 dark:bg-gray-900">
        <Pressable onPress={() => setSearchMode(false)} className="p-2">
          <ArrowLeft size={20} color="#374151" />
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

  return (
    <View className="flex-row items-center">
      {screen === 'home' && (
        <>
          <Pressable onPress={() => setSearchMode(true)}>
            <Search size={22} color="#374151" />
          </Pressable>

          <View className="w-4" />

          <Pressable>
            <Bell size={22} color="#374151" />
          </Pressable>
        </>
      )}

      {screen === 'comunidades' && (
        <>
          <Pressable onPress={() => setSearchMode(true)}>
            <Search size={22} color="#374151" />
          </Pressable>

          <View className="w-4" />

          <Pressable>
            <Bell size={22} color="#374151" />
          </Pressable>
        </>
      )}

      {screen === 'profile' && (
        <>
          <View className="flex-1 items-start">
            <Pressable onPress={() => router.push('/create-post')}>
              <Plus size={22} color="#374151" />
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/edit-profile')}>
            <Pencil size={22} color="#374151" />
          </Pressable>

          <View className="w-4" />

          <Pressable onPress={() => router.push('/modal')}>
            <Settings size={22} color="#374151" />
          </Pressable>
        </>
      )}
    </View>
  );
}
