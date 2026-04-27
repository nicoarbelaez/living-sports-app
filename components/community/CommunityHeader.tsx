import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Bell, Search, X } from 'lucide-react-native';
import { MotiView } from 'moti';

interface Props {
  onSearch: (query: string) => void;
}

export default function CommunityHeader({ onSearch }: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearchToggle = () => {
    if (isSearching) {
      setQuery('');
      onSearch('');
    }
    setIsSearching(!isSearching);
  };

  const handleTextChange = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View className="bg-zinc-50 px-6 pt-12 pb-4 dark:bg-zinc-950">
      <View className="h-12 flex-row items-center justify-between">
        {!isSearching ? (
          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            className="flex-row items-baseline"
          >
            <Text className="text-secondary-foreground text-2xl font-black tracking-tight dark:text-zinc-100">
              Living
            </Text>
            <Text className="ml-1 text-2xl font-black tracking-tight text-green-500">Sport</Text>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '85%' }}
            className="mr-3 h-10 flex-1 flex-row items-center rounded-xl bg-zinc-200 px-4 dark:bg-zinc-800"
          >
            <Search size={18} color="#888" />
            <TextInput
              autoFocus
              value={query}
              onChangeText={handleTextChange}
              placeholder="Buscar comunidades..."
              placeholderTextColor="#888"
              className="ml-2 flex-1 text-zinc-900 dark:text-zinc-100"
            />
          </MotiView>
        )}

        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleSearchToggle}>
            {isSearching ? (
              <X size={24} className="text-zinc-900 dark:text-zinc-100" color="currentColor" />
            ) : (
              <Search size={24} className="text-zinc-900 dark:text-zinc-100" color="currentColor" />
            )}
          </TouchableOpacity>

          {!isSearching && (
            <TouchableOpacity className="relative">
              <Bell size={24} className="text-zinc-900 dark:text-zinc-100" color="currentColor" />
              <View className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-50 bg-green-500 dark:border-zinc-950" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
