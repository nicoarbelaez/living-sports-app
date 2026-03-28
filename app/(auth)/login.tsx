import React from 'react';
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

const LoginScreen = () => {
  const { session } = useAuth();
  const redirectTo = makeRedirectUri();
  console.log({ redirectTo });

  const handleProviderLogin = async (provider: Provider) => {
    try {
      const redirectTo = makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);

        if (result.type === 'success') {
          await supabase.auth.getSession();
        } else {
        }
      }
    } catch (err) {
      console.error('OAuth login error:', err);
    }
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
            Living Sports {session?.user?.email}
          </MotiText>

          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            className="text-lg font-semibold text-center mb-8"
          >
            Sign in to your account to continue
          </MotiText>

          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 300 }}
            className="w-full bg-white rounded-2xl p-6 border border-gray-200"
          >
            <View className="w-full gap-4">
              <AuthButton
                icon={<Mail color="#000000" size={20} />}
                text="Continue with Google"
                onPress={() => handleProviderLogin('google')}
                containerClassName="bg-[#F2F2F7]"
                textClassName="text-black"
              />

              <AuthButton
                icon={<Github color="#FFFFFF" size={20} />}
                text="Continue with GitHub"
                onPress={() => handleProviderLogin('github')}
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
