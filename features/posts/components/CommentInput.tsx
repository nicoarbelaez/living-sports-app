import { useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Send } from 'lucide-react-native';

interface CommentInputProps {
  avatarUrl?: string | null;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  inputRef?: React.RefObject<TextInput>;
}

export default function CommentInput({
  avatarUrl,
  value,
  onChangeText,
  onSend,
  placeholder = 'Añadir comentario...',
  inputRef,
}: CommentInputProps) {
  const localRef = useRef<TextInput>(null);
  const ref = inputRef ?? localRef;

  return (
    <View className="flex-row items-center border-t border-border bg-background px-4 py-3 pb-6">
      <Image
        source={{ uri: avatarUrl ?? undefined }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
        contentFit="cover"
      />
      <TextInput
        ref={ref}
        className="mx-3 flex-1 rounded-xl bg-muted px-3 py-2 text-sm text-foreground"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        multiline
        style={{ maxHeight: 100 }}
        returnKeyType="send"
        onSubmitEditing={onSend}
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim()}
        className={`h-9 w-9 items-center justify-center rounded-full ${value.trim() ? 'bg-primary' : 'bg-muted'}`}
        activeOpacity={0.7}
      >
        <Send size={16} color={value.trim() ? '#fff' : '#9ca3af'} />
      </TouchableOpacity>
    </View>
  );
}
