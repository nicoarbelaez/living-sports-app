import { View, Text, Image } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';

interface PostCardProps {
  user: string;
  time: string;
  avatar: string;
  image: string;
  text: string;
}

export default function PostCard({ user, time, avatar, image, text }: PostCardProps) {
  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow">
      <View className="flex-row items-center px-4 py-3">
        <Image source={{ uri: avatar }} className="h-10 w-10 rounded-full" />

        <View className="ml-3">
          <Text className="font-semibold">{user}</Text>
          <Text className="text-xs text-gray-500">{time}</Text>
        </View>
      </View>

      <Image source={{ uri: image }} className="h-48 w-full" />

      <View className="px-4 py-3">
        <Text className="text-gray-700">{text}</Text>
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
  );
}
