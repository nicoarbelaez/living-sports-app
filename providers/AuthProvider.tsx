import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

interface Props {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType>({ session: null, isLoading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error(error);
          return;
        }

        const session = data?.session ?? null;

        if (isMounted) {
          setSession(session);

          if (!session) {
            router.replace("/(auth)/login");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setIsLoading(false);

      if (!session) {
        router.replace("/(auth)/login");
      }else{
        router.replace("/(tabs)");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to login if user is not authenticated
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect away from login if user is authenticated
      router.replace('/(tabs)');
    }
  }, [session, segments, isLoading, router]);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
