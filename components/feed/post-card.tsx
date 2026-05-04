import React, { useState, memo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import MediaCarousel from './media-carousel';
import { Image } from 'expo-image';
import CommentsSheet from '../comments-sheet';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { usePostStore } from '@/stores/usePostStore';
import type { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  const { session } = useAuth();
  const user = session?.user;

  const updatedPost = usePostStore((state) => state.posts.find((p) => p.id === post.id));

  const currentPost = updatedPost || post;

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(currentPost.likesCount);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ===============================
  // 🔥 CONTAR COMMENTS + REPLIES
  // ===============================
  const fetchCommentsCount = async () => {
    try {
      // 🔥 1. obtener IDs de comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('post_id', post.id);

      if (commentsError) {
        console.log('Error comments:', commentsError);
        return;
      }

      const commentIds = commentsData?.map((c) => c.id) || [];

      // 🔥 2. contar comments
      const commentsCount = commentIds.length;

      // 🔥 3. contar replies SOLO si hay comments
      let repliesCount = 0;

      if (commentIds.length > 0) {
        const { count, error } = await supabase
          .from('comment_replies')
          .select('*', { count: 'exact', head: true })
          .in('comment_id', commentIds);

        if (error) {
          console.log('Error replies:', error);
        } else {
          repliesCount = count || 0;
        }
      }

      // 🔥 TOTAL REAL
      setCommentsTotal(commentsCount + repliesCount);
    } catch (err) {
      console.log('Error total:', err);
    }
  };

  useEffect(() => {
    fetchCommentsCount();
  }, [post.id]);

  // ===============================
  // 🔥 SINCRONIZA LIKES
  // ===============================
  useEffect(() => {
    setLikes(currentPost.likesCount);
  }, [currentPost.likesCount]);

  // ===============================
  // 🔥 CHECK LIKE
  // ===============================
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
    if (!user || loading) return;

    setLoading(true);

    try {
      if (liked) {
        await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);

        setLiked(false);
        setLikes((prev) => prev - 1);
      } else {
        await supabase.from('post_likes').insert({
          post_id: post.id,
          user_id: user.id,
        });

        setLiked(true);
        setLikes((prev) => prev + 1);
      }
    } catch (error) {
      console.log('Error like:', error);
    }

    setLoading(false);
  }, [liked, user, post.id, loading]);

  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow dark:bg-[#111827]">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3">
        <Image
          source={{ uri: currentPost.avatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          contentFit="cover"
        />
        <View className="ml-3">
          <Text className="font-semibold text-gray-900 dark:text-white">{currentPost.user}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{currentPost.time}</Text>
        </View>
      </View>

      {/* MEDIA */}
      <MediaCarousel media={currentPost.media} />

      {/* TEXT */}
      <View className="px-4 py-3">
        <Text className="text-gray-700 dark:text-gray-300">{currentPost.text}</Text>
      </View>

      {/* ACTIONS */}
      <View className="flex-row items-center gap-6 px-4 pb-4">
        {/* LIKE */}
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

        {/* COMMENTS */}
        <TouchableOpacity
          className="flex-row items-center gap-1"
          onPress={() => {
            setShowComments(true);
            fetchCommentsCount(); // 🔥 refresca al abrir
          }}
        >
          <MessageCircle size={18} color="#6b7280" />
          <Text className="text-gray-700 dark:text-gray-300">{commentsTotal}</Text>
        </TouchableOpacity>
      </View>

      {/* COMMENTS */}
      <CommentsSheet
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
      />
    </View>
  );
}

export default memo(PostCard);
