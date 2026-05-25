import { useState, memo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import MediaCarousel from './media-carousel';
import PostAuthorHeader from './post-author-header';
import CommentsSheet from '@/components/shared/comments-sheet';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { usePostStore, usePostById } from '@/features/feed/stores/usePostStore';
import type { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const router = useRouter();

  const { session } = useAuth();
  const user = session?.user;

  const updatedPost = usePostById(post.id);
  const currentPost = updatedPost || post;

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(currentPost.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setLikes(currentPost.likesCount);
  }, [currentPost.likesCount]);

  useEffect(() => {
    const checkLike = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) setLiked(true);
    };

    checkLike();
  }, [post.id, user]);

  const handleLike = useCallback(async () => {
    if (!user || isLiking) return;

    setIsLiking(true);

    try {
      if (liked) {
        await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);

        setLiked(false);
        setLikes((prev) => prev - 1);
        usePostStore.getState().applyLike(post.id, !liked, liked ? -1 : 1);
      } else {
        await supabase.from('post_likes').insert({
          post_id: post.id,
          user_id: user.id,
        });

        setLiked(true);
        setLikes((prev) => prev + 1);
        usePostStore.getState().applyLike(post.id, !liked, liked ? -1 : 1);
      }
    } catch (error) {
      console.log('Error like:', error);
    }

    setIsLiking(false);
  }, [liked, user, post.id, isLiking]);

  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow dark:bg-[#111827]">
      <View className="px-4 py-3">
        <PostAuthorHeader
          avatarUrl={currentPost.avatar}
          name={currentPost.user}
          isoOrRelativeDate={currentPost.createdAt}
          onPress={
            currentPost.authorId ? () => router.push(`/profile/${currentPost.authorId}`) : undefined
          }
        />
      </View>

      <MediaCarousel media={currentPost.media} />

      <View className="px-4 py-3">
        <Text className="text-gray-700 dark:text-gray-300">{currentPost.text}</Text>
      </View>

      <View className="flex-row items-center gap-6 px-4 pb-4">
        <TouchableOpacity
          onPress={handleLike}
          activeOpacity={0.7}
          className="flex-row items-center gap-1"
        >
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: liked ? 1.3 : 1 }}
            transition={{ type: 'spring', damping: 6 }}
          >
            <Heart
              size={18}
              color={liked ? '#ef4444' : '#6b7280'}
              fill={liked ? '#ef4444' : 'transparent'}
            />
          </MotiView>

          <Text className="text-gray-700 dark:text-gray-300">{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1"
          onPress={() => setShowComments(true)}
        >
          <MessageCircle size={18} color="#6b7280" />
          <Text className="text-gray-700 dark:text-gray-300">{currentPost.commentsCount}</Text>
        </TouchableOpacity>
      </View>

      <CommentsSheet
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
        onCommentPosted={() => usePostStore.getState().bumpCommentCount(post.id, 1)}
      />
    </View>
  );
}

export default memo(PostCard);
