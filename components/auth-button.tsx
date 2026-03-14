import { supabase } from "@/lib/supabase";
import { AntDesign } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function AuthButton() {
const handleSignIn = async () => {
  const redirectTo = AuthSession.makeRedirectUri({
  scheme: "livingsportsapp",
});

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });

  if (error) {
    console.error(error);
    return;
  }

  if (Platform.OS === "web") {
    return;
  }

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    if (result.type === "success") {
      const url = new URL(result.url);
const code = url.searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    }
  }
};

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handleSignIn}>
        <AntDesign name="github" size={16} color="white" style={styles.icon} />
        <Text style={styles.text}>Iniciar Sesión con GitHub</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.text}>Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f1419",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#666",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  icon: {
    marginRight: 6,
  },

  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
