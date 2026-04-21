import React, { useState } from 'react';
import { View, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Mail, Github } from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';
import { supabase } from '@/lib/supabase';
import AuthButton, { AuthButtonProps } from '@/components/shared/auth-button';
import type { Provider } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import ThemeToggle from '@/components/shared/theme-toggle';
import { LucideIcon } from '@/types/icons';

type LoginButtonProps = {
  variant?: AuthButtonProps['variant'];
  provider: Provider;
  icon: LucideIcon;
  text: string;
};

const LoginScreen = () => {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleProviderLogin = async (provider: Provider) => {
    try {
      setLoadingProvider(provider);
      const redirectTo = makeRedirectUri();
      console.log(`[OAuth] Using redirect URI: ${redirectTo}`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error(`[OAuth] Error starting ${provider} flow:`, error.message);
        setLoadingProvider(null);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== 'success') {
          console.log('[OAuth] Browser closed before success.');
          setLoadingProvider(null);
        }
      } else {
        console.error('[OAuth] No URL returned from signInWithOAuth');
        setLoadingProvider(null);
      }
    } catch (err) {
      console.error('[OAuth] Error in handleProviderLogin:', err);
      setLoadingProvider(null);
    }
  };

  const LoginButton = ({ variant, provider, icon, text }: LoginButtonProps) => {
    return (
      <AuthButton
        variant={variant}
        icon={icon}
        text={text}
        onPress={() => handleProviderLogin(provider)}
        loading={loadingProvider === provider}
        disabled={loadingProvider !== null && loadingProvider !== provider}
        className="p-5"
        textClassName="dark:text-white text-xl"
      />
    );
  };

  return (
    <View className="bg-secondary-foreground flex-1">
      {/* Oscurecimiento base para legibilidad */}
      <View className="absolute inset-0 bg-black/50" />

      <View className="flex-1 px-6 py-12">
        {/* Contenido principal más abajo */}
        <View className="flex-1 items-center justify-end pb-12">
          <View className="flex w-full items-center gap-48">
            <View className="items-center">
              {/* Logo */}
              <MotiView
                from={{ opacity: 0, translateY: -24 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing',
                  duration: 500,
                }}
                className="mb-8"
              >
                <View className="size-32 items-center justify-center rounded-2xl">
                  <View className="bg-primary absolute inset-0 rounded-2xl blur-xl" />
                  <Image source={require('@/assets/icon.png')} className="size-32" />
                </View>
              </MotiView>

              {/* Título */}
              <MotiView
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'timing',
                  duration: 500,
                }}
                className="mb-2 items-center"
              >
                <View className="flex-row items-baseline justify-center">
                  <MotiText className="text-secondary-foreground text-4xl font-black tracking-tight">
                    Living
                  </MotiText>
                  <MotiText className="ml-1 text-4xl font-black tracking-tight text-green-400">
                    Sports
                  </MotiText>
                </View>
              </MotiView>
            </View>

            {/* Auth */}
            <MotiView
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing',
                duration: 500,
              }}
              className="w-full max-w-sm pt-4"
            >
              <MotiText className="text-md text-secondary-foreground mb-6 text-center font-semibold tracking-wide">
                Inicia sesión para continuar
              </MotiText>

              <View className="gap-3">
                <LoginButton
                  variant="outline"
                  provider="google"
                  icon={<Mail size={20} />}
                  text="Continuar con Google"
                />

                <LoginButton
                  variant="secondary"
                  provider="github"
                  icon={<Github size={20} />}
                  text="Continuar con GitHub"
                />
              </View>
            </MotiView>
          </View>
        </View>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 500,
          }}
          className="w-full max-w-sm self-center"
        >
          <View className="items-end px-6">
            <ThemeToggle />
          </View>
        </MotiView>
      </View>
    </View>
  );
};

export default LoginScreen;
