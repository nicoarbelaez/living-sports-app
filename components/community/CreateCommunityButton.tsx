import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useProfileStore } from '@/features/profile/stores/useProfileStore';
import { useOwnsACommunity } from '@/features/communities/hooks/useCommunityQueries';

export default function CreateCommunityButton() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { data: ownsACommunity, isLoading } = useOwnsACommunity(profile?.id);

  if (isLoading || ownsACommunity) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 60 }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/create-community')}
        className="border-primary bg-primary-pale flex-row items-center gap-3 rounded-2xl border border-dashed px-5 py-4"
      >
        <View className="bg-primary h-10 w-10 items-center justify-center rounded-full">
          <Plus size={20} color="#0e0f0c" />
        </View>
        <View className="flex-1">
          <Text className="text-foreground text-base font-semibold">Crear comunidad</Text>
          <Text className="text-muted-foreground text-sm">Empieza tu propio grupo</Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}
