import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useGroupsStore } from '@/features/communities/stores/useGroupsStore';
import { mapGroupRow } from '@/types/group';

const GYM_EMOJIS = [
  '🏋️','💪','🤸','🏃','🚴','⚽','🏀','🎯','🏊','🥊','🏆','⚡','🔥','🎽','🏅',
];

const communitySchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(80, 'Máximo 80 caracteres'),
  description: z.string().max(300, 'Máximo 300 caracteres').optional(),
  isPublic: z.boolean(),
  emoji: z.string(),
  imageUri: z.string().nullable(),
});

export type CommunityFormValues = z.infer<typeof communitySchema>;

export function useCreateCommunity() {
  const router = useRouter();
  const { session } = useAuth();
  const prependGroup = useGroupsStore((s) => s.prependGroup);

  const randomEmoji = useMemo(
    () => GYM_EMOJIS[Math.floor(Math.random() * GYM_EMOJIS.length)],
    []
  );

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
      emoji: randomEmoji,
      imageUri: null,
    },
  });

  const onSubmit = async (values: CommunityFormValues) => {
    if (!session?.user) throw new Error('Debes estar autenticado');

    const formData = new FormData();
    formData.append('name', values.name);
    if (values.description) formData.append('description', values.description);
    formData.append('is_public', String(values.isPublic));

    if (values.imageUri) {
      const ext = values.imageUri.split('.').pop() || 'jpg';
      formData.append('file', {
        uri: values.imageUri,
        name: `cover.${ext}`,
        type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
      } as unknown as Blob);
    } else {
      formData.append('emoji', values.emoji);
    }

    const { data, error } = await supabase.functions.invoke('create-community', { body: formData });
    if (error || !data?.group) {
      throw new Error(error?.message || data?.message || 'No se pudo crear el grupo');
    }

    prependGroup(mapGroupRow(data.group));
    router.back();
  };

  return { form, onSubmit };
}
