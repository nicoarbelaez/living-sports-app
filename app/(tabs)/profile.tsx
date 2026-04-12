import React, { useState, useCallback } from 'react';
import { View, Text, Image } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  const fallbackName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Usuario';

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio')
      .eq('id', user.id)
      .single();

    if (data) {
      if (data.username) setUsername(data.username);
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      if (data.bio) setBio(data.bio);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [user])
  );

  const avatar =
    avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://ui-avatars.com/api/?name=User';

  return (
    <View className="flex-1 items-center bg-gray-100 px-4 pt-20 dark:bg-black">
      <Image source={{ uri: avatar }} className="mb-4 h-32 w-32 rounded-full" />

      <Text className="text-xl font-semibold text-black dark:text-white">
        {username || fallbackName}
      </Text>

      <Text className="mt-2 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {bio || 'Sin biografía aún'}
      </Text>
    </View>
  );
}
