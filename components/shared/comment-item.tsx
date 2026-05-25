import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react-native';
import PostAuthorHeader from '@/components/feed/post-author-header';

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  depth?: 0 | 1;
  onReply: (user: string, id: string) => void;
  onLike: (id: string) => void;
}

export default function CommentItem({ comment, depth = 0, onReply, onLike }: CommentItemProps) {
  const isReply = depth === 1;

  return (
    <View className={`mt-4 ${isReply ? 'ml-6' : 'px-4'}`}>
      <View className="flex-row">
        <View className="flex-1">
          <View className="flex-row justify-between">
            <View className="flex-1 pr-3">
              <PostAuthorHeader
                avatarUrl={comment.avatar}
                name={comment.user}
                isoOrRelativeDate={comment.time}
                size={isReply ? 'sm' : 'sm'}
              />

              <Text className="text-foreground mt-1 text-sm">{comment.text}</Text>

              <View className="mt-1 flex-row items-center gap-4">
                {comment.likes > 0 && (
                  <Text className="text-muted-foreground text-xs font-semibold">
                    {comment.likes} {comment.likes === 1 ? 'Me gusta' : 'Me gustas'}
                  </Text>
                )}
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => onReply(comment.user, comment.id)}
                  >
                    <Text className="text-muted-foreground text-xs font-semibold">Responder</Text>
                  </Button>
                )}
              </View>
            </View>

            <Button
              variant="ghost"
              size="icon"
              onPress={() => onLike(comment.id)}
              className="mt-1 h-auto min-h-0 w-auto items-center p-2"
            >
              <View className="items-center">
                <Heart
                  size={14}
                  color={comment.isLiked ? '#ef4444' : '#6b7280'}
                  fill={comment.isLiked ? '#ef4444' : 'transparent'}
                />
                {comment.likes > 0 && (
                  <Text
                    className={`mt-0.5 text-[10px] ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    {comment.likes}
                  </Text>
                )}
              </View>
            </Button>
          </View>

          {comment.replies && comment.replies.length > 0 && (
            <View>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={1}
                  onReply={onReply}
                  onLike={onLike}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
