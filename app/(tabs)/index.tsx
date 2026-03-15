import React from 'react';
import { Text, TouchableOpacity, View, Platform, Image, StyleSheet } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';

export default function HomeScreen() {
  const { session } = useAuth();

  if (session) return <AuthenticatedHome session={session} />;
  return <UnauthenticatedHome />;
}

/* ----------------------------- Authenticated view ---------------------------- */

function AuthenticatedHome({ session }: { session: any }) {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.card}>
        <ThemedText type="title">Welcome back,</ThemedText>
        <Text style={styles.emailText}>{session?.user?.email ?? 'User'}</Text>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Link href="/modal">
          <ThemedText type="subtitle" style={styles.linkText}>
            Go to Modal
          </ThemedText>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

/* ----------------------------- Unauthenticated view ---------------------------- */

function UnauthenticatedHome() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.welcomeRow}>
        <ThemedText type="title">Welcome!</ThemedText>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>Living Sports</Text>
          <Dumbbell size={24} color="#84cc16" />
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: 'cmd + d', android: 'cmd + m', web: 'F12' })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Link href="/modal">
          <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        </Link>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh app.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

/* ----------------------------- Styles ---------------------------- */

const styles = StyleSheet.create({
  headerImage: {
    width: 290,
    height: 178,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  card: {
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  signOutButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  linkText: {
    color: '#2563eb',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: '#06b6d4',
    fontWeight: 'bold',
    fontSize: 24,
  },
});