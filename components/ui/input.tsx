import React from 'react';
import { TextInput, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  className?: string;
  error?: boolean;
  style?: StyleProp<TextStyle>;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, error, editable = true, style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor="#9ca3af"
        className={cn(
          'h-12 rounded-[12px] border border-gray-200 bg-white px-4 text-base text-gray-900',
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

Input.displayName = 'Input';

export { Input };
