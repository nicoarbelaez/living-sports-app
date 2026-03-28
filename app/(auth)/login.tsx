import React, { ReactNode, useState } from 'react';
import { View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Github, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { supabase } from '@/lib/supabase';
import AuthButton from '@/components/auth-button';
import { Provider } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import { cn } from '@/lib/utils';

interface LoginButtonProps {
  provider: Provider;
  icon: ReactNode;
  text: string;
  containerClassName: string;
  textClassName: string;
}

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

  const LoginButton = ({
    provider,
    icon,
    text,
    containerClassName,
    textClassName,
  }: LoginButtonProps) => {
    return (
      <AuthButton
        icon={icon}
        text={text}
        onPress={() => handleProviderLogin(provider)}
        loading={loadingProvider === provider}
        disabled={loadingProvider !== null && loadingProvider !== provider}
        containerClassName={cn(containerClassName)}
        textClassName={cn(textClassName)}
      />
    );
  };

  return (
    <LinearGradient colors={['#F7F7F7', '#FFFFFF']} className="flex-1 justify-between p-6">
      <AnimatePresence>
        <View key="content" className="flex h-full items-center justify-center">
          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            className="mb-8 text-center text-4xl font-bold text-foreground"
          >
            Living Sports
          </MotiText>

          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            className="mb-8 text-center text-lg font-semibold text-muted-foreground"
          >
            Inicia sesión para continuar
          </MotiText>

          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 300 }}
            className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <View className="w-full gap-4">
              <LoginButton
                provider="google"
                icon={<Mail color="black" size={20} />}
                text="Continuar con Google"
                containerClassName="bg-secondary "
                textClassName="text-secondary-foreground"
              />

              <LoginButton
                provider="github"
                icon={<Github color="white" size={20} />}
                text="Continuar con GitHub"
                containerClassName="bg-primary shadow-sm "
                textClassName="text-primary-foreground"
              />
            </View>
          </MotiView>
        </View>
      </AnimatePresence>
    </LinearGradient>
  );
};

export default LoginScreen;
