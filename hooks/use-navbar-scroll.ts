import { useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useScrollContext } from '@/providers/scroll-context';
import { useFocusEffect } from 'expo-router';

export function useNavbarScroll() {
  const { handleScroll, resetNavbar } = useScrollContext();

  // Reset navbar visibility when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      resetNavbar();
    }, [resetNavbar])
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      handleScroll(offset);
    },
    [handleScroll]
  );

  return { onScroll };
}
