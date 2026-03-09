import { View, Text, StyleSheet } from "react-native";
import AuthButton from "@/components/auth-button";
import React from "react";
import { Stack } from "expo-router";

export default function Login() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Living Sports</Text>

          <Text style={styles.subtitle}>
            Inicia sesión para acceder a tu cuenta y disfrutar de la
            experiencia completa de Living Sports.
          </Text>

          <View style={styles.buttonContainer}>
            <AuthButton />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  content: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 40,
  },

  buttonContainer: {
    width: "100%",
  },
});