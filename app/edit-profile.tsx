import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
  const router = useRouter();
  const { session } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const user = session?.user;

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fallbackAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://ui-avatars.com/api/?name=User';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    if (data?.username) setUsername(data.username);
    if (data?.avatar_url) setAvatarUrl(data.avatar_url);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Debes permitir acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    setAvatarUrl(image.uri);
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username,
      avatar_url: avatarUrl,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'No se pudo actualizar');
    } else {
      Alert.alert('Listo', 'Perfil actualizado');
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-6 dark:bg-black">
      <View className="mb-6 flex-row items-center">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-black dark:text-white">Editar perfil</Text>
        </View>

        <View className="w-10" />
      </View>

      <View className="mb-6 items-center">
        <Pressable onPress={pickImage}>
          <Image source={{ uri: avatarUrl || fallbackAvatar }} className="h-28 w-28 rounded-full" />
        </Pressable>
      </View>

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
