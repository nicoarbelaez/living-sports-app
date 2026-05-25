import React, { useState } from 'react';
import { View, Image, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Mail, Github } from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';

const LoginScreen = () => {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleProviderLogin = async (provider: Provider) => {
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

      if (!data?.url) {
        setLoadingProvider(null);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== 'success') {
        setLoadingProvider(null);
      }
    } catch (error) {
      console.error(error);
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <ThemeToggle />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* HERO */}
          <View style={styles.heroSection}>
            <MotiView
              from={{
                opacity: 0,
                translateY: -20,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: 'timing',
                duration: 500,
              }}
            >
              <View style={styles.logoWrapper}>
                <View style={styles.logoGlow} />

                <Image
                  source={require('@/assets/icon.png')}
                  resizeMode="contain"
                  style={styles.logo}
                />
              </View>
            </MotiView>

            <MotiView
              from={{
                opacity: 0,
                translateY: 10,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: 'timing',
                duration: 500,
                delay: 100,
              }}
              style={styles.brandSection}
            >
              <View className="flex-row items-center">
                <MotiText className="text-4xl font-black text-white">Living</MotiText>

                <MotiText className="ml-2 text-4xl font-black text-green-400">Sports</MotiText>
              </View>

              <MotiText className="mt-4 text-center text-base text-zinc-400">
                Inicia sesión para continuar
              </MotiText>
            </MotiView>
          </View>

          {/* AUTH */}
          <MotiView
            from={{
              opacity: 0,
              translateY: 20,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 200,
            }}
            style={styles.authSection}
          >
            <Button
              size="lg"
              className="mb-4 h-14 rounded-2xl border border-zinc-700 bg-zinc-900"
              loading={loadingProvider === 'google'}
              disabled={loadingProvider !== null}
              onPress={() => handleProviderLogin('google')}
            >
              <View className="flex-row items-center">
                <Mail size={20} color="white" />

                <MotiText className="ml-3 text-base font-semibold text-white">
                  Continuar con Google
                </MotiText>
              </View>
            </Button>

            <Button
              size="lg"
              className="h-14 rounded-2xl bg-green-500"
              loading={loadingProvider === 'github'}
              disabled={loadingProvider !== null}
              onPress={() => handleProviderLogin('github')}
            >
              <View className="flex-row items-center">
                <Github size={20} color="black" />

                <MotiText className="ml-3 text-base font-semibold text-black">
                  Continuar con GitHub
                </MotiText>
              </View>
            </Button>
          </MotiView>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <MotiText className="text-center text-xs text-zinc-500">
            Al continuar aceptas los términos y políticas de privacidad
          </MotiText>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    alignItems: 'flex-end',
    paddingTop: 8,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 24,
  },

  heroSection: {
    alignItems: 'center',
    marginTop: 32,
  },

  logoWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },

  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    opacity: 0.2,
  },

  logo: {
    width: 128,
    height: 128,
  },

  brandSection: {
    alignItems: 'center',
  },

  authSection: {
    width: '100%',
  },

  footer: {
    paddingBottom: 12,
  },
});
