import "@/global.css";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { AuthProvider } from "@/providers/AuthProvider";
import { ScrollProvider } from "@/providers/scroll-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
  })

  useEffect(()=> {
    if(loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded])

  if(!loaded) {
    return null;
  }

  return (
    <ScrollProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ScrollProvider>
  );
}
