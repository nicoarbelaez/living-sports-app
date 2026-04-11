import React from 'react';
import { View, Text, Image } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileScreen() {
  const { session } = useAuth();

  const user = session?.user;

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://ui-avatars.com/api/?name=User';

  const name =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Usuario';

  return (
    <View className="flex-1 items-center bg-gray-100 px-4 pt-20 dark:bg-black">
      <Image source={{ uri: avatar }} className="mb-4 h-32 w-32 rounded-full" />

      <Text className="text-xl font-semibold text-black dark:text-white">{name}</Text>
    </View>
  );
}
