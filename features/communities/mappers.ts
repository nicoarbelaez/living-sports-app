import type { Community } from '@/types/community';
import type { Group } from '@/types/group';

export function mapGroupToCommunity(group: Group): Community {
  return {
    id: group.id,
    name: group.name,
    followersCount: group.membersCount,
    avatarUrl: group.imageUrl ?? null,
    emoji: group.emoji || undefined,
    isFeatured: false,
  };
}
