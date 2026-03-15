import { View, Text } from "react-native";
import { Search, Bell } from "lucide-react-native";

export default function Header() {
  return (
    <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
      <Text className="text-xl font-bold text-black">Living Sport</Text>

      <View className="flex-row gap-5">
        <Search size={22} color="#374151" />
        <Bell size={22} color="#374151" />
      </View>
    </View>
  );
}