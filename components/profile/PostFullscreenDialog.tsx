import React from 'react';
import { Modal, TouchableOpacity, ScrollView, View } from 'react-native';
import PostCard from '@/components/feed/post-card';
import type { Post } from '@/types/post';

interface PostFullscreenDialogProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostFullscreenDialog({ post, onClose }: PostFullscreenDialogProps) {
  return (
    <Modal
      visible={!!post}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center' }}
      >
        <TouchableOpacity activeOpacity={1}>
          <View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 24 }}
            >
              {post && <PostCard post={post} />}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
