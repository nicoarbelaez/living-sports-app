import type { Tables } from '@/types/database.types';

export type GroupRow = Tables<'groups'>;

export interface Group {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  emoji: string | null;
  isPublic: boolean;
  membersCount: number;
  createdAt: string;
}

export function mapGroupRow(row: GroupRow): Group {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
    emoji: row.emoji ?? null,
    isPublic: row.is_public,
    membersCount: row.members_count,
    createdAt: row.created_at,
  };
}
