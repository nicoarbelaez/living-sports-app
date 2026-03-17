import { Tabs } from "expo-router";
import { Home, Users, User } from "lucide-react-native";
import HeaderActions from "@/components/header";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{  
          title: "HOME",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
          headerRight: () => <HeaderActions screen="home" />,
        }}
      />

      <Tabs.Screen
        name="comunidades"
        options={{
          title: "COMUNIDADES",
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
          headerRight: () => <HeaderActions screen="comunidades" />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "PERFIL",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
          headerRight: () => <HeaderActions screen="profile" />,
        }}
      />
    </Tabs>
  );
}