import React from 'react';
import { useRouter } from 'expo-router';
import CreateActionCard from '@/components/ui/create-action-card';

export default function CreateCompetitionCard({ groupId }: { groupId: string }) {
  const router = useRouter();
  const navigateToCreate = () => router.push(`/competition/create?groupId=${groupId}` as any);

  return (
    <CreateActionCard
      variant="grid"
      title={`Nueva\ncompetición`}
      onPress={navigateToCreate}
      contextMenuItems={[{ label: 'Nueva competición', onPress: navigateToCreate }]}
    />
  );
}
