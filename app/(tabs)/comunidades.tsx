import { View, Text } from "react-native";
import Header from "@/components/header";

export default function Comunidades() {
  return (
    <View className="flex-1 bg-gray-100">
      <Header />

      <View className="flex-1 items-center justify-center">
        <Text>Comunidades Screen</Text>
      </View>
    </View>
  );
}