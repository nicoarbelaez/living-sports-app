import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Heart, MessageCircle } from "lucide-react-native";
import CommentsSheet from "./comments-sheet";

interface PostCardProps {
  user: string;
  time: string;
  avatar: string;
  image: string;
  text: string;
}

export default function PostCard({
  user,
  time,
  avatar,
  image,
  text,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <View className="mx-4 mt-3 bg-white rounded-2xl shadow overflow-hidden">
      
      <View className="flex-row items-center px-4 py-3">
        <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full" />

        <View className="ml-3">
          <Text className="font-semibold">{user}</Text>
          <Text className="text-xs text-gray-500">{time}</Text>
        </View>
      </View>

      <Image source={{ uri: image }} className="w-full h-48" />

      <View className="px-4 py-3">
        <Text className="text-gray-700">{text}</Text>
      </View>

      <View className="flex-row items-center gap-6 px-4 pb-4">
        <View className="flex-row items-center gap-1">
          <Heart size={18} color="#ef4444" />
          <Text>34</Text>
        </View>

        <TouchableOpacity 
          className="flex-row items-center gap-1"
          onPress={() => setShowComments(true)}
        >
          <MessageCircle size={18} color="#6b7280" />
          <Text>2</Text>
        </TouchableOpacity>
      </View>

      <CommentsSheet 
        isVisible={showComments} 
        onClose={() => setShowComments(false)} 
      />
    </View>
  );
}