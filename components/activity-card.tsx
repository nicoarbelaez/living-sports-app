import { View, Text } from "react-native";

export default function ActivityCard() {
  return (
    <View className="mx-4 mt-4 bg-white rounded-2xl p-4 flex-row items-center justify-between shadow">
      <View className="w-20 h-20 border-4 border-blue-500 rounded-full items-center justify-center">
        <Text className="text-xs text-gray-500">META</Text>
      </View>

      <View>
        <Text className="text-lg font-bold">
          1,000 <Text className="text-gray-500 text-sm font-normal">kcal</Text>
        </Text>

        <Text className="text-lg font-bold">
          1,000 <Text className="text-gray-500 text-sm font-normal">pasos</Text>
        </Text>

        <Text className="text-lg font-bold">
          10 <Text className="text-gray-500 text-sm font-normal">km</Text>
        </Text>
      </View>
    </View>
  );
}