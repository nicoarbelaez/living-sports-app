export interface Community {
  id: string;
  name: string;
  followersCount: number;
  avatarUrl: string | null;
  emoji?: string;
  isFeatured?: boolean;
}
