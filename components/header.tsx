import React from 'react';
import { View } from 'react-native';
import { Search, Bell, Users, Settings } from 'lucide-react-native';

type Props = {
  screen: 'home' | 'comunidades' | 'profile';
};

export default function HeaderActions({ screen }: Props) {
  return (
    <View className="flex-row items-center">
      {screen === 'home' && (
        <>
          <Search size={22} color="#374151" />
          <View className="w-4" />
          <Bell size={22} color="#374151" />
        </>
      )}

      {screen === 'comunidades' && (
        <>
          <Search size={22} color="#374151" />
          <View className="w-4" />
          <Bell size={22} color="#374151" />
        </>
      )}

      {screen === 'profile' && (
        <>
          <Settings size={22} color="#374151" />
        </>
      )}
    </View>
  );
}
