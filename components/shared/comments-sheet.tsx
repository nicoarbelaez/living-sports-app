import { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useComments } from '@/features/posts/hooks/useComments';
import CommentsSection from '@/features/posts/components/CommentsSection';
import CommentInput from '@/features/posts/components/CommentInput';

interface CommentsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
  onCommentPosted?: () => void;
}

export default function CommentsSheet({
  isVisible,
  onClose,
  postId,
  onCommentPosted,
}: CommentsSheetProps) {
  const { session } = useAuth();
  const user = session?.user;
  const inputRef = useRef<TextInput>(null);
  const [newComment, setNewComment] = useState('');

  const { comments, profile, replyTo, setReplyTo, handleLike, handleSend } = useComments(
    postId,
    isVisible,
    user?.id
  );

  const placeholder = replyTo ? `Respondiendo a ${replyTo.user}...` : 'Añadir comentario...';

  const onSend = async () => {
    const text = newComment.trim();
    if (!text) return;
    const ok = await handleSend(text);
    if (ok) {
      setNewComment('');
      onCommentPosted?.();
    }
  };

  const onReply = (replyUser: string, id: string) => {
    setReplyTo({ user: replyUser, id });
    setNewComment(`@${replyUser} `);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background h-[85%] overflow-hidden rounded-t-3xl">
          <View className="border-border flex-row items-center justify-between border-b px-4 py-4">
            <View className="w-6" />
            <Text className="text-foreground text-base font-bold">Comentarios</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <CommentsSection comments={comments} onLike={handleLike} onReply={onReply} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <CommentInput
              avatarUrl={profile?.avatar_url}
              value={newComment}
              onChangeText={setNewComment}
              onSend={onSend}
              placeholder={placeholder}
              inputRef={inputRef}
            />
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}
