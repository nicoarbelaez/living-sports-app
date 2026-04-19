import { Tables } from '@/database.types';

/** Full profile row from the DB — single source of truth. */
export type UserProfile = Tables<'profiles'>;

/**
 * Subset persisted to MMKV.
 * Criteria: identity fields + UI flags that must be available before any network fetch.
 * Excluded: counts (dynamic), bio/height/phone (only needed on profile screen).
 */
export type CachedProfile = Pick<
  UserProfile,
  | 'id'
  | 'username'
  | 'first_name'
  | 'last_name'
  | 'avatar_url'
  | 'is_public'
  | 'is_complete'
  | 'dark_mode'
>;
