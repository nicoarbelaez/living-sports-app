import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';

export default function PostCardSkeleton() {
  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white dark:bg-[#111827]">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3">
        <Skeleton className="h-10 w-10 rounded-full" />

        <View className="ml-3 flex-1 gap-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </View>
      </View>

      {/* MEDIA CAROUSEL PLACEHOLDER */}
      <View className="w-full">
        <Skeleton className="h-56 w-full" />
      </View>

      {/* TEXT CONTENT */}
      <View className="gap-2 px-4 py-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-3/5 rounded-md" />
      </View>

      {/* FOOTER ACTIONS */}
      <View className="flex-row items-center gap-6 px-4 pb-4">
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-6 rounded-md" />
        </View>

        <View className="flex-row items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-6 rounded-md" />
        </View>
      </View>
    </View>
  );
}
