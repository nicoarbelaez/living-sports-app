import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Initial session error:', error);
          return;
        }

        const session = data?.session ?? null;

        if (isMounted) {
          setSession(session);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] State Change Event: ${event}`);
      console.log(`[Auth] User: ${session?.user?.email ?? 'No User'}`);

      if (isMounted) {
        setSession(session);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
