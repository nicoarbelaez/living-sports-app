import '@/global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ScrollProvider } from '@/providers/scroll-context';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const url = Linking.useURL();

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
      // Must be logged in, redirect to login
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Must NOT be in auth group if logged in, redirect to home
      router.replace('/');
    }
  }, [session, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="(auth)" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ScrollProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ScrollProvider>
  );
}
