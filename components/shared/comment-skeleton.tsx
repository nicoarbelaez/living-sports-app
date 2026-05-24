import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';

function CommentSkeletonItem() {
  return (
    <View className="flex-row px-4 py-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <View className="ml-3 flex-1 gap-2">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </View>
    </View>
  );
}

export default function CommentSkeleton() {
  return (
    <View>
      <CommentSkeletonItem />
      <CommentSkeletonItem />
      <CommentSkeletonItem />
      <CommentSkeletonItem />
    </View>
  );
}
