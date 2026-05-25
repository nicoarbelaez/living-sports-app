import { FlatList, View, Text } from 'react-native';
import CommentItem from '@/components/shared/comment-item';
import type { Comment } from '@/components/shared/comment-item';

interface CommentsSectionProps {
  comments: Comment[];
  onLike: (id: string) => void;
  onReply: (user: string, id: string) => void;
}

export default function CommentsSection({ comments, onLike, onReply }: CommentsSectionProps) {
  if (comments.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-sm text-muted-foreground">Sin comentarios aún. ¡Sé el primero!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CommentItem comment={item} depth={0} onReply={onReply} onLike={onLike} />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
