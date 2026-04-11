import React, { useState, useCallback } from 'react';
import { View, Text, Image } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const [username, setUsername] = useState('');

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://ui-avatars.com/api/?name=User';

  const fallbackName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Usuario';

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();

    if (data?.username) {
      setUsername(data.username);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [user])
  );

  return (
    <View className="flex-1 items-center bg-gray-100 px-4 pt-20 dark:bg-black">
      <Image source={{ uri: avatar }} className="mb-4 h-32 w-32 rounded-full" />

      <Text className="text-xl font-semibold text-black dark:text-white">
        {username || fallbackName}
      </Text>
    </View>
  );
}
