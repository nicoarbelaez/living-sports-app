import { View, Text } from "react-native";
import Header from "@/components/header";

export default function Perfil() {
  return (
    <View className="flex-1 bg-gray-100">
      <Header />

      <View className="flex-1 items-center justify-center">
        <Text>Profile Screen</Text>
      </View>
    </View>
  );
}