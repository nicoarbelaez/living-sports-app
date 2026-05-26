import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { formatRelativeEs } from '@/lib/date/formatRelativeEs';

interface PostAuthorHeaderProps {
  avatarUrl: string;
  name: string;
  /** ISO date string OR already-formatted relative string */
  isoOrRelativeDate: string;
  size?: 'sm' | 'md';
  onPress?: () => void;
}

export default function PostAuthorHeader({
  avatarUrl,
  name,
  isoOrRelativeDate,
  size = 'md',
  onPress,
}: PostAuthorHeaderProps) {
  const avatarSize = size === 'sm' ? 28 : 40;
  const avatarRadius = avatarSize / 2;

  const isIso = /^\d{4}-\d{2}-\d{2}T/.test(isoOrRelativeDate);
  const timeLabel = isIso ? formatRelativeEs(isoOrRelativeDate) : isoOrRelativeDate;

  const content = (
    <View className="flex-row items-center">
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: avatarSize, height: avatarSize, borderRadius: avatarRadius }}
        contentFit="cover"
      />
      <View className="ml-3">
        <Text className="text-foreground font-semibold">{name}</Text>
        <Text className="text-muted-foreground text-xs">{timeLabel}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
