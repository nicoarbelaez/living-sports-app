import '@/global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ScrollProvider } from '@/providers/scroll-context';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/providers/theme';
import { useProfileSync } from '@/hooks/useProfileSync';
import { usePostStore } from '@/stores/usePostStore';

WebBrowser.maybeCompleteAuthSession();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const url = Linking.useURL();

  // Profile Realtime sync + background fetch — runs for the entire app lifetime.
  useProfileSync();

  // Reset feed data on logout so stale posts don't appear on re-login.
  useEffect(() => {
    if (!isLoading && !session) {
      usePostStore.getState().reset();
    }
  }, [session, isLoading]);

  useEffect(() => {
    if (url) {
      const fragment = url.split('#')[1];
      if (fragment) {
        const params = Object.fromEntries(new URLSearchParams(fragment).entries());
        const { access_token, refresh_token } = params;

        if (access_token && refresh_token) {
          supabase.auth.setSession({ access_token, refresh_token }).then(({ error, data }) => {
            if (error) {
              console.error('[Linking] Auth setSession Error:', error.message);
            } else if (data.session) {
              console.log(
                '[Linking] Session successfully initialized for:',
                data.session.user.email
              );
            }
          });
        }
      }
    }
  }, [url]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, isLoading, segments, router]);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="(auth)" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ScrollProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </ScrollProvider>
    </ThemeProvider>
  );
}
