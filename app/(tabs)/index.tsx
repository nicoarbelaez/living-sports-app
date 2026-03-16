import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';

import ActivityCard from "@/components/activity-card";
import Header from "@/components/header";
import PostCard from "@/components/post-card";
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

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
    <View className="flex-1 bg-gray-100">
      <Header />

      <ScrollView>
        <View style={styles.card}>
          <Text style={styles.emailText}>Signed in as: {session?.user?.email ?? 'User'}</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <ActivityCard />

        <PostCard
          user="Nicolas"
          time="Hace 2 horas"
          avatar="https://avatars.githubusercontent.com/u/111522939?v=4"
          image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b"
          text="Hola Chavales! Acabo de completar una carrera de 5 km en 25 minutos. ¡Estoy muy emocionado por mi progreso! #Running #Fitness"
        />

        <PostCard
          user="Cristiano"
          time="Hace 1 minuto"
          avatar="https://instagram.fclo1-4.fna.fbcdn.net/v/t51.2885-19/472007201_1142000150877579_994350541752907763_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fclo1-4.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2QH68d2Kz8PnedVxySy8djVyfp9t2ozmrCEq4STgGoB0MBZEtUDT8gHUKh0GYMNt7nE&_nc_ohc=jdw21VYLqxoQ7kNvwF750-d&_nc_gid=mUOfs5PHW-jQkreYRt7mwA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfyzylhMjG7XJY2h8epzAVDv2q66eJt-Nxv2D3JU9-QkJA&oe=69BCFF1E&_nc_sid=8b3546"
          image="https://i.ytimg.com/vi/D61hfPHcLKc/hq720.jpg"
          text="Es falso, no me lesioné, solo estaba descansando después de un entrenamiento intenso. #Fitness #NoPainNoGain"
        />
      </ScrollView>
    </View>
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
