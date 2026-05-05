import React from 'react';
import {
  View,
  Text,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { MotiView } from 'moti';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextInputProps {
  className?: string;
  error?: boolean;
  style?: StyleProp<TextStyle>;
  maxChars?: number;
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ className, error, editable = true, style, maxChars, value, onChangeText, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;
    const isOver = maxChars !== undefined && currentLength > maxChars;
    const hasError = error || isOver;

    return (
      <View>
        <TextInput
          ref={ref}
          editable={editable}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          className={cn(
            'border-border bg-background text-foreground min-h-24 rounded-[12px] border px-4 py-3 text-base',
            hasError && 'border-destructive',
            !editable && 'opacity-50',
            className
          )}
          style={[style, { paddingHorizontal: 4 }]}
          {...props}
        />
        {maxChars !== undefined && (
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: isOver ? 1.1 : 1 }}
            transition={{ type: 'timing', duration: 150 }}
            className="items-end px-1 pt-1"
          >
            <Text className={`text-xs ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
              {currentLength}/{maxChars}
            </Text>
          </MotiView>
        )}
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
