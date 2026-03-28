import React, { ReactNode, useState } from 'react';
import { View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Github, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { supabase } from '@/lib/supabase';
import AuthButton from '@/components/auth-button';
import { Provider } from '@supabase/supabase-js';
import { useAuth } from '@/providers/AuthProvider';
import { makeRedirectUri } from 'expo-auth-session';

interface LoginButtonProps {
  provider: Provider;
  icon: ReactNode;
  text: string;
  containerClassName: string;
  textClassName: string;
}

const LoginScreen = () => {
  const { session } = useAuth();
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
        containerClassName={containerClassName}
        textClassName={textClassName}
      />
    );
  };

  return (
    <LinearGradient colors={['#F7F7F7', '#FFFFFF']} className="flex-1 justify-between p-6">
      <AnimatePresence>
        <View key="content" className="flex justify-center items-center h-full">
          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            className="text-4xl font-bold text-center mb-8"
          >
            Living Sports
          </MotiText>

          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            className="text-lg font-semibold text-center mb-8"
          >
            Inicia sesión para continuar
          </MotiText>

          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 300 }}
            className="w-full bg-white rounded-2xl p-6 border border-gray-200"
          >
            <View className="w-full gap-4">
              <LoginButton
                provider="google"
                icon={<Mail color="#000000" size={20} />}
                text="Continuar con Google"
                containerClassName="bg-[#F2F2F7]"
                textClassName="text-black"
              />

              <LoginButton
                provider="github"
                icon={<Github color="#FFFFFF" size={20} />}
                text="Continuar con GitHub"
                containerClassName="bg-black"
                textClassName="text-white"
              />
            </View>
          </MotiView>
        </View>
      </AnimatePresence>
    </LinearGradient>
  );
};

export default LoginScreen;
