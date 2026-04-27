import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

function SkeletonBlock({ className }: { className: string }) {
  return <View className={`bg-muted rounded ${className}`} />;
}

export default function CompetitionCardSkeleton() {
  return (
    <MotiView
      from={{ opacity: 1 }}
      animate={{ opacity: 0.4 }}
      transition={{ type: 'timing', duration: 900, loop: true, repeatReverse: true }}
      className="m-1 flex-1"
    >
      <View className="border-border bg-card gap-3 rounded-2xl border px-4 py-6">
        <SkeletonBlock className="h-5 w-16 rounded-full" />
        <View className="gap-1.5">
          <SkeletonBlock className="h-3.5 w-full" />
          <SkeletonBlock className="h-3.5 w-3/4" />
        </View>
        <View className="gap-1">
          <SkeletonBlock className="h-3 w-4/5" />
          <SkeletonBlock className="h-3 w-2/3" />
        </View>
      </View>
    </MotiView>
  );
}
