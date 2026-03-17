import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Heart } from "lucide-react-native";

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  level?: number;
  onReply: (user: string, id: string) => void;
  onLike: () => void;
}

export default function CommentItem({ comment, level = 0, onReply, onLike }: CommentItemProps) {
  const isReply = level > 0;

  return (
    <View className={`mt-4 ${isReply ? "ml-10" : "px-4"}`}>
      <View className="flex-row">
        <Image 
          source={{ uri: comment.avatar }} 
          className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full`} 
        />
        
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm">
                <Text className="font-bold text-gray-900">{comment.user}</Text>
                {"  "}
                <Text className="text-gray-800">{comment.text}</Text>
              </Text>
              
              <View className="flex-row items-center mt-1 gap-4">
                <Text className="text-xs text-gray-500">{comment.time}</Text>
                {comment.likes > 0 && (
                  <Text className="text-xs font-semibold text-gray-500">
                    {comment.likes} likes
                  </Text>
                )}
                <TouchableOpacity onPress={() => onReply(comment.user, comment.id)}>
                  <Text className="text-xs font-semibold text-gray-500">Reply</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="mt-1" onPress={onLike}>
              <Heart size={14} color={comment.likes > 0 ? "#ef4444" : "#6b7280"} fill={comment.likes > 0 ? "#ef4444" : "transparent"} />
            </TouchableOpacity>
          </View>

          {/* Render Replies Recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <View>
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  level={level + 1} 
                  onReply={onReply}
                  onLike={() => onLike()} // For simplicity, trigger same like logic
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
