import { View } from "react-native";
import { Search, Bell, Settings } from "lucide-react-native";

type Props = {
  screen: "home" | "comunidades" | "profile";
};

export default function HeaderActions({ screen }: Props) {
  if (screen === "home") {
    return (
      <View style={{ flexDirection: "row", gap: 15 }}>
        <Search size={22} color="#374151" />
        <Bell size={22} color="#374151" />
      </View>
    );
  }

  if (screen === "comunidades") {
    return (
      <View style={{ flexDirection: "row", gap: 15 }}>
        <Search size={22} color="#374151" />
        <Bell size={22} color="#374151" />
      </View>
    );
  }

  if (screen === "profile") {
    return (
      <View style={{ flexDirection: "row", gap: 15 }}>
        <Settings size={22} color="#374151" />
        <Bell size={22} color="#374151" />  
      </View>
    );
  }

  return null;
}