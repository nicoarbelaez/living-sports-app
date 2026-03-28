import React from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FloatingNavbar } from '@/components/floating-navbar';
import { MaterialTopTabs } from '@/components/swipable-tabs';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <MaterialTopTabs
      tabBar={(props) => <FloatingNavbar {...props} />}
      tabBarPosition="bottom" // We position our floating navbar at the bottom
      screenOptions={{
        // Hide the default top tab bar styling
        tabBarShowLabel: false,
        tabBarStyle: { height: 0, position: 'absolute', top: -100 }, // Ensure it's hidden
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'HOME',
        }}
      />

      <MaterialTopTabs.Screen
        name="comunidades"
        options={{
          title: 'COMUNIDADES',
        }}
      />

      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'PERFIL',
        }}
      />
    </MaterialTopTabs>
  );
}