import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { ArrowLeft, Users } from 'lucide-react-native';
import { useCreateCommunity } from '@/features/communities/hooks/useCreateCommunity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GroupImagePicker from '@/components/community/GroupImagePicker';

export default function CreateCommunityScreen() {
  const router = useRouter();
  const { form, onSubmit } = useCreateCommunity();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;

  const handleSubmitWithAlert = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error inesperado');
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-100 dark:bg-black"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6 pt-6">
        <Button
          variant="ghost"
          size="icon"
          icon={<ArrowLeft size={24} />}
          onPress={() => router.back()}
          className="bg-muted mb-8 rounded-full"
        />

        <Text className="mb-2 text-3xl font-black text-black dark:text-white">Crear Comunidad</Text>
        <Text className="mb-8 text-base text-gray-500 dark:text-gray-400">
          Configura un nuevo espacio para entrenar con tus amigos.
        </Text>

        <Controller
          control={control}
          name="imageUri"
          render={({ field: { value, onChange } }) => (
            <Controller
              control={control}
              name="emoji"
              render={({ field: { value: emojiVal, onChange: onEmojiChange } }) => (
                <GroupImagePicker
                  imageUri={value}
                  emoji={emojiVal}
                  onImageChange={onChange}
                  onEmojiChange={onEmojiChange}
                  disabled={isSubmitting}
                />
              )}
            />
          )}
        />

        <View className="mt-8 gap-5">
          <View>
            <Text className="mb-2 font-semibold text-gray-900 dark:text-white">
              Nombre de la comunidad
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ej. Tenis en la ciudad"
                  editable={!isSubmitting}
                  error={!!errors.name}
                />
              )}
            />
            {errors.name && (
              <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
            )}
          </View>

          <View>
            <Text className="mb-2 font-semibold text-gray-900 dark:text-white">Descripción</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="¿De qué trata tu comunidad?"
                  multiline
                  numberOfLines={4}
                  editable={!isSubmitting}
                  error={!!errors.description}
                  className="h-28 py-3"
                />
              )}
            />
            {errors.description && (
              <Text className="mt-1 text-xs text-red-500">{errors.description.message}</Text>
            )}
          </View>

          <View className="mt-2 flex-row items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <Text className="flex-1 text-sm leading-relaxed text-blue-700 dark:text-blue-300">
              Tu comunidad será pública. Cualquiera podrá encontrarla y unirse.
            </Text>
          </View>
        </View>

        <Button
          onPress={handleSubmitWithAlert}
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<Users size={20} />}
          className="mt-8 rounded-2xl py-4"
          size="lg"
        >
          <Text className="text-primary-foreground text-lg font-bold">Crear Comunidad</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
