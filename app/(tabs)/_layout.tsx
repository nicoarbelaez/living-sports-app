import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Compass } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // nuevo comportamiento
        tabBarButton: HapticTab,

        // colores dinámicos
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.icon,

        // estilos del tab bar con soporte dark mode
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size ?? 24} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size ?? 24} />
          ),
        }}
      />
    </Tabs>
  );
}