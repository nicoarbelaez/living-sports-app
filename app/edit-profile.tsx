import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
  const router = useRouter();
  const { session } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const user = session?.user;

  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [originalBio, setOriginalBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const fallbackAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://ui-avatars.com/api/?name=User';

  const hasChanges =
    username !== originalUsername || avatarUrl !== originalAvatar || bio !== originalBio;

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (username === originalUsername) {
        setIsAvailable(null);
        setIsChecking(false);
        return;
      }
      checkUsername(username);
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio')
      .eq('id', user.id)
      .single();

    if (data?.username) {
      setUsername(data.username);
      setOriginalUsername(data.username);
    }

    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
      setOriginalAvatar(data.avatar_url);
    }

    if (data?.bio) {
      setBio(data.bio);
      setOriginalBio(data.bio);
    }
  };

  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value)
      .maybeSingle();

    setIsAvailable(!data);
    setIsChecking(false);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Debes permitir acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    setAvatarUrl(image.uri);
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    try {
      let uploadedUrl = avatarUrl;

      if (avatarUrl && avatarUrl.startsWith('file://')) {
        const fileName = `${user.id}-${Date.now()}.jpg`;

        const file = {
          uri: avatarUrl,
          name: fileName,
          type: 'image/jpeg',
        } as any;

        const formData = new FormData();
        formData.append('file', file);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData as any, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          Alert.alert('Error', 'No se pudo subir la imagen');
          return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        uploadedUrl = data.publicUrl;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username,
        avatar_url: uploadedUrl,
        bio,
      });

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar');
        return;
      }

      Alert.alert('Listo', 'Perfil actualizado');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 px-5 pt-10 dark:bg-black">
      <View className="mb-8 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-white p-2 dark:bg-gray-800"
        >
          <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
        </Pressable>

        <Text className="text-lg font-bold text-black dark:text-white">Editar perfil</Text>

        <View className="w-8" />
      </View>

      <View className="mb-8 items-center">
        <Pressable onPress={pickImage} className="relative">
          <Image
            source={{ uri: avatarUrl || fallbackAvatar }}
            className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800"
          />

          <View className="absolute right-0 bottom-0 rounded-full bg-blue-500 p-2">
            <Camera size={16} color="white" />
          </View>
        </Pressable>
      </View>

      <Text
        className={`mb-2 text-sm ${focused ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
      >
        Nombre de usuario
      </Text>

      <View
        className={`rounded-2xl border px-4 py-3 ${
          focused
            ? 'border-blue-500 bg-white dark:bg-gray-800'
            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
        }`}
      >
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Tu nombre de usuario"
          placeholderTextColor="#9ca3af"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            fontSize: 16,
            color: isDark ? 'white' : 'black',
            paddingVertical: 2,
          }}
        />
      </View>

      <View className="mt-2">
        {isChecking && <Text className="text-sm text-gray-500">Validando...</Text>}

        {!isChecking && isAvailable === true && (
          <Text className="text-sm text-green-500">Disponible</Text>
        )}

        {!isChecking && isAvailable === false && (
          <Text className="text-sm text-red-500">Ya está en uso</Text>
        )}
      </View>

      <Text className="mt-6 mb-2 text-sm text-gray-500 dark:text-gray-400">Biografía</Text>

      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Cuéntanos algo sobre ti..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={4}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          textAlignVertical: 'top',
          color: isDark ? 'white' : 'black',
        }}
        className="rounded-2xl border border-gray-200 bg-white text-base dark:border-gray-700 dark:bg-gray-800"
      />

      <Pressable
        onPress={handleSave}
        disabled={loading || isAvailable === false || !hasChanges}
        className={`mt-6 rounded-2xl py-4 shadow-md ${
          loading || isAvailable === false || !hasChanges ? 'bg-gray-400' : 'bg-blue-500'
        }`}
      >
        <Text className="text-center text-base font-semibold text-white">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Text>
      </Pressable>
    </View>
  );
}
