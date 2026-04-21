import React from 'react';
import { useRouter } from 'expo-router';
import CreateActionCard from '@/components/ui/create-action-card';

export default function CreateCommunityButton() {
  const router = useRouter();

  return (
    <CreateActionCard
      variant="row"
      title="Crear comunidad"
      subtitle="Empieza tu propio grupo"
      onPress={() => router.push('/create-community')}
      contextMenuItems={[
        { label: 'Crear comunidad', onPress: () => router.push('/create-community') },
      ]}
    />
  );
}
