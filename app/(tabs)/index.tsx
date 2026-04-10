import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import ActivityCard from '@/components/activity-card';
import PostCard from '@/components/post-card';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavbarScroll } from '@/hooks/use-navbar-scroll';
import { Session } from '@supabase/supabase-js';

export default function HomeScreen() {
  const { session } = useAuth();

  return <AuthenticatedHome session={session} />;
}

function AuthenticatedHome({ session }: { session: Session | null }) {
  const { onScroll } = useNavbarScroll();
  const isDark = useColorScheme() === 'dark';

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
        {/* CARD */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.emailText, isDark && styles.textDark]}>
            Signed in as: {session?.user?.email ?? 'User'}
          </Text>

          <TouchableOpacity
            style={[styles.signOutButton, isDark && styles.signOutButtonDark]}
            onPress={handleSignOut}
          >
            <Text style={[styles.signOutText]}>Sign Out</Text>
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
          avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdnSj_ePgbGDuzLJwvMXBneYkiVU9aPqY7pZEDvXty5mUFtDoMlmyVb3piUk6uqeC1rWnDFETXX7QRtBDWItAo74ipNslZF9j9uYKyNW0&s=10"
          image="https://i.ytimg.com/vi/D61hfPHcLKc/hq720.jpg"
          text="Es falso, no me lesioné, solo estaba descansando después de un entrenamiento intenso. #Fitness #NoPainNoGain"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  containerDark: {
    backgroundColor: '#000',
  },

  card: {
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  cardDark: {
    backgroundColor: '#111827',
  },

  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  textDark: {
    color: '#fff',
  },

  signOutButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutButtonDark: {
    backgroundColor: '#374151',
  },

  signOutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
  },
});
