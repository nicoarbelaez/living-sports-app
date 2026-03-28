import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

interface Props {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  setIsLoading: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

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
            router.replace('/login');
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
        router.replace('/login');
      } else {
        router.replace('/');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, segments]);

  return (
    <AuthContext.Provider value={{ session, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
