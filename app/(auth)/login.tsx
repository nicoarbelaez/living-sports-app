import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { supabase } from '../../lib/supabase';
import * as Linking from 'expo-linking';
import { Github, Mail } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText, AnimatePresence } from 'moti';

const LoginScreen = () => {
  const [googlePressed, setGooglePressed] = useState(false);
  const [githubPressed, setGithubPressed] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = Linking.createURL('/');
      console.log('--- DIAGNOSTICS: Google Login ---');
      console.log('Redirecting to:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        }
      });
      
      if (error) {
        console.error('--- SUPABASE GOOGLE OAUTH ERROR ---');
        console.error('Error Object:', JSON.stringify(error, null, 2));
      } else {
        console.log('Supabase Initial Response:', data);
      }
    } catch (err) {
      console.error('Caught exception during Google Login:', err);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const redirectUrl = Linking.createURL('/');
      console.log('--- DIAGNOSTICS: GitHub Login ---');
      console.log('Redirecting to:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        }
      });
      
      if (error) {
        console.error('--- SUPABASE GITHUB OAUTH ERROR ---');
        console.error('Error Object:', JSON.stringify(error, null, 2));
      } else {
        console.log('Supabase Initial Response:', data);
      }
    } catch (err) {
      console.error('Caught exception during GitHub Login:', err);
    }
  };

  return (
    <LinearGradient
      colors={['#F7F7F7', '#FFFFFF']}
      style={styles.container}
    >
      <AnimatePresence>
        <MotiText 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 800 }}
          style={styles.headerText}
        >
          LIVING SPORT
        </MotiText>
        
        <View style={styles.content}>
          <MotiText 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ 
              opacity: 1, 
              translateY: 0,
              scale: [1, 1.03, 1]
            }}
            transition={{
              opacity: { type: 'timing', duration: 800, delay: 0 },
              translateY: { type: 'timing', duration: 800, delay: 0 },
              scale: {
                type: 'timing',
                duration: 2000,
                loop: true,
              }
            }}
            style={styles.title}
          >
            Living Sports
          </MotiText>
          
          <MotiText 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            style={styles.subtitle}
          >
            Sign in to your account to continue
          </MotiText>

          <MotiView 
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 300 }}
            style={styles.cardContainer}
          >
            <View style={styles.buttonContainer}>
              <MotiView
                animate={{ scale: googlePressed ? 0.95 : 1 }}
                transition={{ 
                  type: 'spring', 
                  damping: 10, 
                  mass: 0.5 
                }}
              >
                <Pressable 
                  onPressIn={() => setGooglePressed(true)}
                  onPressOut={() => setGooglePressed(false)}
                  onPress={handleGoogleLogin}
                >
                  <View style={styles.button}>
                    <Mail color="#000000" size={20} style={styles.icon} />
                    <MotiText style={styles.buttonText}>Continue with Google</MotiText>
                  </View>
                </Pressable>
              </MotiView>

              <MotiView
                animate={{ scale: githubPressed ? 0.95 : 1 }}
                transition={{ 
                  type: 'spring', 
                  damping: 10, 
                  mass: 0.5 
                }}
              >
                <Pressable 
                  onPressIn={() => setGithubPressed(true)}
                  onPressOut={() => setGithubPressed(false)}
                  onPress={handleGithubLogin}
                >
                  <View style={[styles.button, styles.githubButton]}>
                    <Github color="#FFFFFF" size={20} style={styles.icon} />
                    <MotiText style={[styles.buttonText, styles.githubButtonText]}>Continue with GitHub</MotiText>
                  </View>
                </Pressable>
              </MotiView>
            </View>
          </MotiView>
        </View>
      </AnimatePresence>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 48,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      }
    }),
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  githubButton: {
    backgroundColor: '#000000',
  },
  githubButtonText: {
    color: '#FFFFFF',
  },
});


export default LoginScreen;

