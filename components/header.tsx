import React from 'react';
import { View, Pressable } from 'react-native';
import { Search, Bell, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Props = {
  screen: 'home' | 'comunidades' | 'profile';
};

export default function HeaderActions({ screen }: Props) {
  const router = useRouter();

  return (
    <View className="flex-row items-center">
      {screen === 'home' && (
        <>
          <Pressable onPress={() => router.push('/modal')}>
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
          <Pressable>
            <Search size={22} color="#374151" />
          </Pressable>

          <View className="w-4" />

          <Pressable>
            <Bell size={22} color="#374151" />
          </Pressable>
        </>
      )}

      {screen === 'profile' && (
        <Pressable onPress={() => router.push('/modal')}>
          <Settings size={22} color="#374151" />
        </Pressable>
      )}
    </View>
  );
}
