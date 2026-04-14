import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image as ImageIcon, Camera, Send, X, Video as VideoIcon } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/async/withTimeout';
import { Image } from 'expo-image';
import { getRandomAvatarUrl } from '@/lib/utils';
import { useProfileStore } from '@/stores/useProfileStore';
import type { Post } from '@/types/post';

const MediaItemSchema = z.object({
  uri: z.string().min(1),
  type: z.enum(['image', 'video']),
});

const PostFormSchema = z
  .object({
    text: z.string().max(500, 'Máximo 500 caracteres'),
    medias: z.array(MediaItemSchema).max(5, 'Máximo 5 archivos'),
  })
  .refine((data) => data.text.trim().length > 0 || data.medias.length > 0, {
    message: 'Escribe algo o adjunta un archivo',
    path: ['text'],
  });

type PostFormValues = z.infer<typeof PostFormSchema>;

interface CreatePostResponse {
  post: Omit<Post, 'likesCount' | 'commentsCount'>;
}

export interface FormPostProps {
  onPostCreated: (post: Post) => void;
}

const TIMEOUT_MS = 30_000;

export default function FormPost({ onPostCreated }: FormPostProps) {
  const profile = useProfileStore((s) => s.profile);

  const avatarSeed = profile?.username ?? profile?.first_name ?? 'atleta';
  const avatarUri =
    profile?.avatar_url && !profile.avatar_url.includes('avatars.githubusercontent.com')
      ? profile.avatar_url
      : getRandomAvatarUrl(avatarSeed);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(PostFormSchema),
    defaultValues: { text: '', medias: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medias',
  });

  const handlePickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - fields.length,
      quality: 1,
      base64: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const processed = await Promise.all(
      result.assets.map(async (asset) => {
        const isVideo = asset.type === 'video';
        let uri = asset.uri;

        if (!isVideo) {
          const manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 1080 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: false }
          );
          uri = manipResult.uri;
        }

        return { uri, type: (isVideo ? 'video' : 'image') as 'image' | 'video' };
      })
    );

    processed.forEach((item) => append(item));
  };

  const handleTakeMedia = async () => {
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (!camPerm.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 1,
      base64: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const isVideo = asset.type === 'video';
    let uri = asset.uri;

    if (!isVideo) {
      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: false }
      );
      uri = manipResult.uri;
    }

    append({ uri, type: isVideo ? 'video' : 'image' });
  };

  const onSubmit = async (values: PostFormValues) => {
    const formData = new FormData();
    formData.append('text', values.text.trim());

    values.medias.forEach((item) => {
      const extension = item.type === 'video' ? 'mp4' : 'jpg';
      const mimeType = item.type === 'video' ? 'video/mp4' : 'image/jpeg';
      formData.append('file', {
        uri: item.uri,
        name: `upload_${Date.now()}.${extension}`,
        type: mimeType,
      } as unknown as Blob);
    });

    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke<CreatePostResponse>('create-post', { body: formData }),
        TIMEOUT_MS
      );

      if (error) throw new Error(error.message);
      if (!data?.post) throw new Error('Respuesta del servidor no contiene la publicación.');

      const post: Post = { ...data.post, likesCount: 0, commentsCount: 0 };
      onPostCreated(post);
      reset();
    } catch (err) {
      Alert.alert(
        'Error al publicar',
        err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
      );
    }
  };

  const canSubmit = !isSubmitting;

  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#111827]">
      <View className="flex-row items-start px-4 py-3">
        <Image
          source={{ uri: avatarUri }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          contentFit="cover"
        />

        <View className="ml-3 flex-1">
          <Controller
            control={control}
            name="text"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                multiline
                placeholder="¿Qué tienes en mente, atleta?"
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="mb-2 max-h-32 min-h-[40px] p-0 text-base text-gray-800 dark:text-gray-200"
              />
            )}
          />

          {errors.text && <Text className="mb-1 text-xs text-red-500">{errors.text.message}</Text>}

          {fields.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-2">
              {fields.map((field, index) => (
                <View
                  key={field.id}
                  className="relative mr-3 h-40 w-32 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                >
                  {field.type === 'image' ? (
                    <Image
                      source={{ uri: field.uri }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="relative h-full w-full items-center justify-center rounded-xl border border-gray-600 bg-gray-900">
                      <Image
                        source={{ uri: field.uri }}
                        style={{ width: '100%', height: '100%', opacity: 0.5 }}
                        contentFit="cover"
                      />
                      <VideoIcon color="white" size={32} className="absolute" />
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1"
                    onPress={() => remove(index)}
                  >
                    <X color="white" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-gray-100 px-4 pt-3 pb-3 dark:border-[#374151]">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={handlePickMedia}
            className="flex-row items-center gap-1"
            disabled={isSubmitting || fields.length >= 5}
          >
            <ImageIcon color="#10b981" size={20} />
            <Text className="font-medium text-gray-600 dark:text-gray-400">Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTakeMedia}
            className="flex-row items-center gap-1"
            disabled={isSubmitting || fields.length >= 5}
          >
            <Camera color="#10b981" size={20} />
            <Text className="font-medium text-gray-600 dark:text-gray-400">Cámara</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!canSubmit}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            canSubmit ? 'bg-[#10b981]' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text
                className={canSubmit ? 'font-semibold text-white' : 'font-semibold text-gray-400'}
              >
                Publicar
              </Text>
              <Send color={canSubmit ? 'white' : '#9ca3af'} size={16} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
