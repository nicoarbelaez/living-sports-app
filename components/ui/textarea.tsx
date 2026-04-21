import React from 'react';
import { TextInput, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextInputProps {
  className?: string;
  error?: boolean;
  style?: StyleProp<TextStyle>;
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ className, error, editable = true, style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        editable={editable}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#9ca3af"
        className={cn(
          'min-h-24 rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-base text-gray-900',
          'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
          error && 'border-red-500 dark:border-red-500',
          !editable && 'opacity-50',
          className
        )}
        style={[style, { paddingHorizontal: 4 }]}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
