import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/providers/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingNavbar } from '@/components/shared/floating-navbar';
import { MaterialTopTabs } from '@/components/shared/swipable-tabs';
import HeaderActions from '@/components/shared/header';
import { useSegments } from 'expo-router';

export default function TabsLayout() {
  const segments = useSegments();
  const current = segments[segments.length - 1];

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const screen =
    current === 'comunidades' ? 'comunidades' : current === 'profile' ? 'profile' : 'home';

  return (
    <View className={isDark ? 'flex-1 bg-black' : 'flex-1 bg-gray-50'}>
      {/* HEADER */}
      <SafeAreaView edges={['top']} className={isDark ? 'bg-black' : 'bg-white'}>
        <View
          className={
            isDark
              ? 'h-14 flex-row items-center justify-between border-b border-gray-800 px-4'
              : 'h-14 flex-row items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm'
          }
        >
          <View />
          <HeaderActions screen={screen} />
        </View>
      </SafeAreaView>

      {/* BODY */}
      <View className={isDark ? 'flex-1 bg-gray-900' : 'flex-1 bg-gray-100'}>
        <MaterialTopTabs
          tabBar={(props) => <FloatingNavbar {...props} />}
          screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: { height: 0, position: 'absolute', top: -100 },
          }}
        >
          <MaterialTopTabs.Screen name="index" />
          <MaterialTopTabs.Screen name="comunidades" />
          <MaterialTopTabs.Screen name="profile" />
        </MaterialTopTabs>
      </View>
    </View>
  );
}
