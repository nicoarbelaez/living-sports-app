import React, { useCallback, useRef } from 'react';
import { View, Text } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { TextInput } from 'react-native';
import CommentItem from './comment-item';
import CommentSkeleton from './comment-skeleton';
import CommentInput from './comment-input';
import { useComments } from './use-comments';

const SNAP_POINTS = ['85%'];

interface CommentsSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CommentsSheet({ isVisible, onClose }: CommentsSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);

  const { comments, isLoading, newComment, setNewComment, replyTo, handleReply, handleSend, handleLike } =
    useComments(isVisible);

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const onReply = useCallback(
    (user: string, id: string) => {
      handleReply(user, id);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [handleReply]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      enableOverDrag={false}
      keyboardBehavior="extend"
      android_keyboardInputMode="adjustResize"
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', height: 4, width: 40 }}
      handleStyle={{ backgroundColor: 'transparent' }}
    >
      <View style={{ flex: 1 }}>
        <BottomSheetFlatList
          data={isLoading ? [] : comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentItem comment={item} onReply={onReply} onLike={handleLike} />
          )}
          ListHeaderComponent={
            <Text className="text-foreground px-4 pt-4 pb-2 text-base font-bold">Comentarios</Text>
          }
          ListEmptyComponent={isLoading ? <CommentSkeleton /> : null}
          style={{ flex: 1 }}
        />
        <CommentInput
          inputRef={inputRef}
          replyTo={replyTo}
          newComment={newComment}
          onChangeText={setNewComment}
          onSend={handleSend}
        />
      </View>
    </BottomSheetModal>
  );
}
