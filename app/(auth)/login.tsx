import React, { useState } from 'react';
import { View, Image, ImageBackground, ColorValue, useColorScheme } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Mail, Github } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { supabase } from '@/lib/supabase';
import AuthButton, { AuthButtonProps } from '@/components/auth-button';
import type { Provider } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import ThemeToggle from '@/components/theme-toggle';
import { LucideIcon } from '@/types/icons';

type LoginButtonProps = {
  variant?: AuthButtonProps['variant'];
  provider: Provider;
  icon: LucideIcon;
  text: string;
};

const LoginScreen = () => {
  const isDark = useColorScheme() === 'dark';

  const bgImage = {
    uri: 'https://img.freepik.com/foto-gratis/alegre-deportista-posa-fotografo-club-gimnasia-oscuro_613910-14470.jpg?semt=ais_incoming&w=740&q=80',
  };

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

  const getGradientColors = (isDark: boolean): [ColorValue, ColorValue, ...ColorValue[]] => {
    if (isDark) {
      return ['rgb(24, 24, 27)', 'rgba(24, 24, 27,0.8)', 'rgba(24, 24, 27,0.3)'];
    }

    return ['rgb(255, 255, 255)', 'rgba(134, 134, 140,0.8)', 'rgba(24, 24, 27,0.2)'];
  };

  return (
    <View className="flex-1 bg-black">
      <ImageBackground source={bgImage} resizeMode="cover" className="flex-1">
        {/* Oscurecimiento base para legibilidad */}
        <View className="absolute inset-0 bg-black/50" />

        {/* Gradiente inferior -> superior */}
        <LinearGradient
          colors={getGradientColors(isDark)}
          locations={[0, 0.6, 1]}
          start={{ x: 0.4, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          className="absolute inset-0"
        />

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
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
