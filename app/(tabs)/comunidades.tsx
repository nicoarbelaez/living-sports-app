import { View, Text, ScrollView } from "react-native";
import Header from "@/components/header";
import { useNavbarScroll } from "@/hooks/use-navbar-scroll";

export default function Comunidades() {
  const { onScroll } = useNavbarScroll();

  return (
    <View className="flex-1 bg-gray-100">
      <Header />

      <ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center">
          <Text>Comunidades Screen</Text>
        </View>
      </ScrollView>
    </View>
  );
}