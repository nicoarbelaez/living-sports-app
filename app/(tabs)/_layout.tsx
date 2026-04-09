import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingNavbar } from '@/components/floating-navbar';
import { MaterialTopTabs } from '@/components/swipable-tabs';
import HeaderActions from '@/components/header';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView>
        <View
          style={{
            height: 60,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingHorizontal: 16,
            borderBottomWidth: 0.5,
            borderColor: '#e5e7eb',
          }}
        >
          <HeaderActions screen="home" />
        </View>
      </SafeAreaView>
      <MaterialTopTabs
        tabBar={(props) => <FloatingNavbar {...props} />}
        tabBarPosition="bottom"
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: { height: 0, position: 'absolute', top: -100 },
        }}
      >
        <MaterialTopTabs.Screen name="index" options={{ title: 'HOME' }} />
        <MaterialTopTabs.Screen name="comunidades" options={{ title: 'COMUNIDADES' }} />
        <MaterialTopTabs.Screen name="profile" options={{ title: 'PERFIL' }} />
      </MaterialTopTabs>
    </View>
  );
}
