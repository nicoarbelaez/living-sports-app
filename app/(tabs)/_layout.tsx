import React from 'react';
import { View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';

import { FloatingNavbar } from '@/components/floating-navbar';
import { MaterialTopTabs } from '@/components/swipable-tabs';
import HeaderActions from '@/components/header';

export default function TabsLayout() {
  const segments = useSegments();

  const current = segments[segments.length - 1];

  // DARK MODE
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  const screen =
    current === 'comunidades' ? 'comunidades' : current === 'profile' ? 'profile' : 'home';

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      {/* HEADER */}
      <SafeAreaView edges={['top']} className="bg-white dark:bg-black">
        <View className="h-14 flex-row items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-zinc-800 dark:bg-black">
          <View />

          <HeaderActions screen={screen} />
        </View>
      </SafeAreaView>

      {/* BODY */}
      <View className="flex-1 bg-gray-100 dark:bg-zinc-950">
        <MaterialTopTabs
          tabBar={(props) => <FloatingNavbar {...props} />}
          screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 0,
              position: 'absolute',
              top: -100,
            },
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
