import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';

export default function EditProfile() {
  const router = useRouter();
  const { session } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const user = session?.user;

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://ui-avatars.com/api/?name=User';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (data) {
      setUsername(data.username);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase.from('profiles').update({ username }).eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'No se pudo actualizar el nombre');
    } else {
      Alert.alert('Listo', 'Nombre actualizado');
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-6 dark:bg-black">
      {/* HEADER */}
      <View className="mb-6 flex-row items-center">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-black dark:text-white">Editar perfil</Text>
        </View>

        <View className="w-10" />
      </View>

      {/* AVATAR */}
      <View className="mb-6 items-center">
        <Image source={{ uri: avatar }} className="h-28 w-28 rounded-full" />
      </View>

      {/* INPUT */}
      <View className="mb-4">
        <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">Nombre de usuario</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Tu nombre"
          placeholderTextColor="#9ca3af"
          className="rounded-xl bg-white px-4 py-3 text-black dark:bg-gray-800 dark:text-white"
        />
      </View>

      {/* BOTÓN */}
      <Pressable
        onPress={handleSave}
        disabled={loading}
        className="mt-4 items-center rounded-xl bg-blue-500 py-4"
      >
        <Text className="font-semibold text-white">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Text>
      </Pressable>
    </View>
  );
}
