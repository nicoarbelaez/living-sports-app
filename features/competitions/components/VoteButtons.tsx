import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

interface VoteButtonsProps {
  entryId: string;
  canVote: boolean;
  onVoted?: () => void;
}

export default function VoteButtons({ entryId, canVote, onVoted }: VoteButtonsProps) {
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const isDisabled = !canVote || voted || voting;

  const handleVote = async (vote: 'approve' | 'reject') => {
    if (isDisabled) return;
    setVoting(true);
    try {
      const { error } = await supabase.functions.invoke('vote-evidence', {
        body: { entry_id: entryId, vote },
      });
      if (error) throw new Error(error.message);
      setVoted(true);
      onVoted?.();
    } finally {
      setVoting(false);
    }
  };

  if (voting) {
    return (
      <View className="flex-row items-center justify-center py-2">
        <ActivityIndicator size="small" color="#6b7280" />
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={() => handleVote('approve')}
        disabled={isDisabled}
        className={`flex-1 items-center rounded-xl py-2.5 ${
          isDisabled ? 'bg-muted' : 'bg-primary'
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            isDisabled ? 'text-muted-foreground' : 'text-primary-foreground'
          }`}
        >
          {voted ? '✓ Avalado' : '✓ Avalar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleVote('reject')}
        disabled={isDisabled}
        className={`flex-1 items-center rounded-xl py-2.5 ${
          isDisabled ? 'bg-muted' : 'bg-destructive'
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            isDisabled ? 'text-muted-foreground' : 'text-destructive-foreground'
          }`}
        >
          ✗ Rechazar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
