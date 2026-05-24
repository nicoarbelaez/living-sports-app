import React from 'react';
import { View, Text, Image } from 'react-native';
import type { TextInput } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CURRENT_USER } from './use-comments';

interface CommentInputProps {
  inputRef: React.RefObject<TextInput | null>;
  replyTo: { user: string; id: string } | null;
  newComment: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export default function CommentInput({
  inputRef,
  replyTo,
  newComment,
  onChangeText,
  onSend,
}: CommentInputProps) {
  return (
    <View className="border-border bg-background flex-row items-center border-t px-4 py-3 pb-6">
      <Image source={{ uri: CURRENT_USER.avatar }} className="h-9 w-9 rounded-full" />
      <Input
        ref={inputRef}
        className="mx-3 flex-1"
        placeholder={replyTo ? `Replying to ${replyTo.user}...` : 'Add a comment...'}
        value={newComment}
        onChangeText={onChangeText}
        multiline
        style={{ maxHeight: 100 }}
      />
      <Button variant="link" size="sm" onPress={onSend} disabled={!newComment.trim()}>
        <Text className="text-primary font-bold">Publicar</Text>
      </Button>
    </View>
  );
}
