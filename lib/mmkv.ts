import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({ id: 'living-sports-store' });

/**
 * Zustand persist middleware adapter backed by MMKV.
 * Synchronous reads/writes — no async overhead.
 */
export const zustandMMKVStorage: StateStorage = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => storage.set(key, value),
  removeItem: (key: string): void => {
    storage.remove(key);
  },
};
