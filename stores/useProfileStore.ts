import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/lib/mmkv';
import { fetchProfileFromAPI } from '@/lib/profile';
import type { CachedProfile, UserProfile } from '@/types/profile';

interface ProfileState {
  profile: CachedProfile | null;
  /** True once the store has attempted at least one network fetch. */
  isSyncing: boolean;
}

interface ProfileActions {
  /**
   * Persist only the cacheable subset of a full profile row.
   * Called by the Realtime handler and after a successful fetch.
   */
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  /**
   * Background sync: fetches latest from API, updates store + MMKV.
   * Safe to call at any time — errors are swallowed and logged.
   */
  refreshProfile: (userId: string) => Promise<void>;
}

type ProfileStore = ProfileState & ProfileActions;

const toCached = (profile: UserProfile): CachedProfile => ({
  id: profile.id,
  username: profile.username,
  first_name: profile.first_name,
  last_name: profile.last_name,
  avatar_url: profile.avatar_url,
  is_public: profile.is_public,
  is_complete: profile.is_complete,
  dark_mode: profile.dark_mode,
});

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      isSyncing: false,

      setProfile: (profile) =>
        set({ profile: toCached(profile) }),

      clearProfile: () =>
        set({ profile: null, isSyncing: false }),

      refreshProfile: async (userId) => {
        set({ isSyncing: true });
        try {
          const fresh = await fetchProfileFromAPI(userId);
          set({ profile: toCached(fresh) });
        } catch (err) {
          console.warn('[ProfileStore] Background refresh failed:', err);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'profile-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
      // Only persist the cacheable slice — never isSyncing
      partialize: (state): Pick<ProfileState, 'profile'> => ({
        profile: state.profile,
      }),
    }
  )
);
