import { View, Text } from 'react-native';

export default function ActivityCard() {
  return (
    <View className="mx-4 mt-4 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow">
      <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-blue-500">
        <Text className="text-xs text-gray-500">META</Text>
      </View>

      <View>
        <Text className="text-lg font-bold">
          1,000 <Text className="text-sm font-normal text-gray-500">kcal</Text>
        </Text>

        <Text className="text-lg font-bold">
          1,000 <Text className="text-sm font-normal text-gray-500">pasos</Text>
        </Text>

        <Text className="text-lg font-bold">
          10 <Text className="text-sm font-normal text-gray-500">km</Text>
        </Text>
      </View>
    </View>
  );
}
