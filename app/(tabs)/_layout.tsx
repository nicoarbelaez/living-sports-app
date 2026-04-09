import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingNavbar } from '@/components/floating-navbar';
import { MaterialTopTabs } from '@/components/swipable-tabs';
import HeaderActions from '@/components/header';
import { useSegments } from 'expo-router';

export default function TabsLayout() {
  const segments = useSegments();
  const current = segments[segments.length - 1];

  const screen =
    current === 'comunidades' ? 'comunidades' : current === 'profile' ? 'profile' : 'home';

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="h-14 flex-row items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
          <View />
          <HeaderActions screen={screen} />
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-gray-100">
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
