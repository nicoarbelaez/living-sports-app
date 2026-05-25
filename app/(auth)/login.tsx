import { useState, useCallback } from 'react';
import { View, Image, useColorScheme } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';

import { Mail, Github } from 'lucide-react-native';

import { MotiView, MotiText } from 'moti';

import { supabase } from '@/lib/supabase';

import AuthButton from '@/components/shared/auth-button';

import type { Provider } from '@supabase/supabase-js';

import { makeRedirectUri } from 'expo-auth-session';

import ThemeToggle from '@/components/shared/theme-toggle';

const LoginScreen = () => {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleProviderLogin = useCallback(async (provider: Provider) => {
    try {
      setLoadingProvider(provider);

      const redirectTo = makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error(error.message);
        setLoadingProvider(null);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type !== 'success') {
          setLoadingProvider(null);
        }
      }
    } catch (err) {
      console.error(err);
      setLoadingProvider(null);
    }
  }, []);

  const isLoading = loadingProvider !== null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} animated />

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDark ? '#0e0f0c' : '#ffffff',
        }}
        edges={['top', 'bottom']}
      >
        <View className="bg-background flex-1">
          {/* Background */}
          <View className="absolute inset-0 overflow-hidden">
            {/* Top glow */}
            <View
              style={{
                position: 'absolute',
                top: -120,
                left: -40,
                width: 260,
                height: 260,
                borderRadius: 999,
                backgroundColor: isDark ? '#9fe87020' : '#9fe87040',
              }}
            />

            {/* Bottom glow */}
            <View
              style={{
                position: 'absolute',
                bottom: -160,
                right: -60,
                width: 320,
                height: 320,
                borderRadius: 999,
                backgroundColor: isDark ? '#c5edab10' : '#9fe87025',
              }}
            />
          </View>

          {/* Header */}
          <View className="flex-row justify-end px-6 pt-2">
            <ThemeToggle />
          </View>

          {/* Hero */}
          <View className="flex-1 items-center justify-center px-6">
            <MotiView
              from={{
                opacity: 0,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                type: 'spring',
                damping: 16,
                stiffness: 180,
              }}
            >
              <View
                className="bg-primary size-28 items-center justify-center rounded-[32px] border border-white/10"
                style={{
                  shadowColor: '#9fe870',
                  shadowOpacity: 0.35,
                  shadowRadius: 24,
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  elevation: 12,
                }}
              >
                <Image
                  source={require('@/assets/icon.png')}
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: 20,
                  }}
                />
              </View>
            </MotiView>

            <MotiView
              from={{
                opacity: 0,
                translateY: 18,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                delay: 120,
                duration: 500,
              }}
              className="mt-8 items-center"
            >
              <View className="flex-row items-baseline">
                <MotiText className="text-foreground text-5xl font-black tracking-tight">
                  Living
                </MotiText>

                <MotiText className="text-primary text-5xl font-black tracking-tight">
                  Sports
                </MotiText>
              </View>

              <MotiText className="text-muted-foreground mt-3 text-center text-sm leading-6">
                La comunidad fitness que
                {'\n'}
                impulsa tu progreso
              </MotiText>
            </MotiView>
          </View>

          {/* Auth Card */}
          <MotiView
            from={{
              opacity: 0,
              translateY: 30,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              delay: 250,
              duration: 450,
            }}
            className="border-border bg-card/95 mx-5 mb-5 gap-3 rounded-[28px] border p-5"
          >
            <MotiText className="text-muted-foreground mb-1 text-center text-sm font-medium">
              Inicia sesión para continuar
            </MotiText>

            <AuthButton
              variant="default"
              icon={<Mail size={20} color="#0e0f0c" />}
              text="Continuar con Google"
              onPress={() => handleProviderLogin('google')}
              loading={loadingProvider === 'google'}
              disabled={isLoading && loadingProvider !== 'google'}
              className="h-14 rounded-2xl"
            />

            <AuthButton
              variant="outline"
              icon={<Github size={20} />}
              text="Continuar con GitHub"
              onPress={() => handleProviderLogin('github')}
              loading={loadingProvider === 'github'}
              disabled={isLoading && loadingProvider !== 'github'}
              className="border-border bg-primary-pale h-14 rounded-2xl"
            />
          </MotiView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default LoginScreen;
