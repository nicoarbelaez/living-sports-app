import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  fetchCommunityDetail,
  type GroupDetail,
} from '@/features/communities/services/fetchCommunityDetail';

export function useCommunityDetail(id: string | undefined) {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      fetchCommunityDetail(id).then((data) => {
        setGroup(data);
        setLoading(false);
      });
    }, [id])
  );

  return { group, loading };
}
