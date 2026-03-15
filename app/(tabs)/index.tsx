import { View, Text, Image, ScrollView } from "react-native";
import { Search, Bell, Heart, MessageCircle } from "lucide-react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-black">Living Sport</Text>

        <View className="flex-row gap-5">
          <Search size={22} color="#374151" />
          <Bell size={22} color="#374151" />
        </View>
      </View>

      <ScrollView>
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 flex-row items-center justify-between shadow">
          <View className="w-20 h-20 border-4 border-blue-500 rounded-full items-center justify-center">
            <Text className="text-xs text-gray-500">META</Text>
          </View>

          <View>
            <Text className="text-lg font-bold">
              1,000{" "}
              <Text className="text-gray-500 text-sm font-normal">kcal</Text>
            </Text>

            <Text className="text-lg font-bold">
              1,000{" "}
              <Text className="text-gray-500 text-sm font-normal">pasos</Text>
            </Text>

            <Text className="text-lg font-bold">
              10 <Text className="text-gray-500 text-sm font-normal">km</Text>
            </Text>
          </View>
        </View>

        <View className="mx-4 mt-3 bg-white rounded-2xl shadow overflow-hidden">
          <View className="flex-row items-center px-4 py-3">
            <Image
              source={{
                uri: "https://avatars.githubusercontent.com/u/111522939?v=4",
              }}
              className="w-10 h-10 rounded-full"
            />

            <View className="ml-3">
              <Text className="font-semibold">Nicolas</Text>
              <Text className="text-xs text-gray-500">Hace 2 horas</Text>
            </View>
          </View>

          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b",
            }}
            className="w-full h-48"
          />

          <View className="px-4 py-3">
            <Text className="text-gray-700">
              Hola Chavales! Acabo de completar una carrera de 5 km en el parque
              y me siento increíble. El clima estaba perfecto y la energía de la
              comunidad fue contagiosa. ¡Vamos por más kilómetros juntos!
              #RunningCommunity
            </Text>
          </View>

          <View className="flex-row items-center gap-6 px-4 pb-4">
            <View className="flex-row items-center gap-1">
              <Heart size={18} color="#ef4444" />
              <Text>34</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <MessageCircle size={18} color="#6b7280" />
              <Text>2</Text>
            </View>
          </View>
        </View>

        <View className="mx-4 mt-3 bg-white rounded-2xl shadow overflow-hidden">
          <View className="flex-row items-center px-4 py-3">
            <Image
              source={{
                uri: "https://instagram.fclo1-4.fna.fbcdn.net/v/t51.2885-19/472007201_1142000150877579_994350541752907763_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fclo1-4.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2QH68d2Kz8PnedVxySy8djVyfp9t2ozmrCEq4STgGoB0MBZEtUDT8gHUKh0GYMNt7nE&_nc_ohc=jdw21VYLqxoQ7kNvwF750-d&_nc_gid=mUOfs5PHW-jQkreYRt7mwA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfyzylhMjG7XJY2h8epzAVDv2q66eJt-Nxv2D3JU9-QkJA&oe=69BCFF1E&_nc_sid=8b3546",
              }}
              className="w-10 h-10 rounded-full"
            />

            <View className="ml-3">
              <Text className="font-semibold">Cristiano</Text>
              <Text className="text-xs text-gray-500">Hace 1 minuto</Text>
            </View>
          </View>

          <Image
            source={{
              uri: "https://i.ytimg.com/vi/D61hfPHcLKc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAw6Pq9NWfcFpALCdw_9ZD5BDj76w",
            }}
            className="w-full h-48"
          />

          <View className="px-4 py-3">
            <Text className="text-gray-700">
              Es falso, no me lesioné, solo me caí. ¡Vamos por más goles juntos!
              #FootballCommunity
            </Text>
          </View>

          <View className="flex-row items-center gap-6 px-4 pb-4">
            <View className="flex-row items-center gap-1">
              <Heart size={18} color="#ef4444" />
              <Text>34</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <MessageCircle size={18} color="#6b7280" />
              <Text>2</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
