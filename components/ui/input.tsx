import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  className?: string;
  error?: boolean;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, error, editable = true, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor="#9ca3af"
        className={cn(
          'h-12 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900',
          'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
          error && 'border-red-500 dark:border-red-500',
          !editable && 'opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
