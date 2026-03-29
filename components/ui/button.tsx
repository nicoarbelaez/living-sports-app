import * as React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  View,
  StyleProp,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LucideIcon } from '@/types/icons';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg shrink-0 gap-2 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs active:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs active:bg-destructive/90 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs active:bg-accent active:text-accent-foreground dark:bg-input/30 dark:border-input dark:active:bg-input/50',
        secondary: 'bg-secondary text-secondary shadow-xs active:bg-secondary/80',
        ghost: 'active:bg-accent active:text-accent-foreground  dark:active:bg-accent/50',
        link: 'text-primary underline-offset-4 active:underline',
      },
      size: {
        default: 'min-h-9 px-4 py-2',
        sm: 'min-h-8 rounded-lg px-3 py-2',
        lg: 'min-h-10 rounded-lg px-6 py-3',
        icon: 'size-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonProps = Omit<PressableProps, 'children' | 'onPress' | 'style'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    disabled?: boolean;
    icon?: LucideIcon;
    children?: React.ReactNode;
    onPress?: (event: GestureResponderEvent) => void;
    className?: string;
    iconStyle?: string;
    style?: StyleProp<ViewStyle>;
  };

function resolveIconColor(variant?: ButtonProps['variant'], isDark = false) {
  switch (variant) {
    case 'outline':
    case 'ghost':
    case 'link':
      return isDark ? '#ffffff' : '#111827';
    case 'secondary':
    case 'destructive':
      return isDark ? '#ffffff' : '#111827';
    case 'default':
    default:
      return '#ffffff';
  }
}

function enhanceIcon(icon: LucideIcon, color: string): LucideIcon {
  if (!React.isValidElement(icon)) return icon;

  if (icon.props?.color) return icon;

  return React.cloneElement(icon, {
    color,
  });
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled = false,
  icon,
  children,
  onPress,
  iconStyle,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isDisabledOrLoading = disabled || loading;
  const spinnerColor = resolveIconColor(variant, isDark);
  const iconColor = resolveIconColor(variant, isDark);

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (!isDisabledOrLoading) {
        onPress?.(event);
      }
    },
    [isDisabledOrLoading, onPress]
  );

  const enhancedIcon = !loading && icon ? enhanceIcon(icon, iconColor) : null;

  const content = (
    <View className={cn('flex-row items-center justify-center', size !== 'icon' && 'gap-2')}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : enhancedIcon ? (
        <View className={cn('shrink-0', iconStyle)}>{enhancedIcon}</View>
      ) : null}

      {children}
    </View>
  );

  const baseClassName = cn(
    buttonVariants({ variant, size }),
    isDisabledOrLoading && 'opacity-50',
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      className: cn(baseClassName, (children as any).props?.className),
      onPress: handlePress,
      disabled: isDisabledOrLoading,
      style,
      children: content,
    });
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabledOrLoading}
      onPress={handlePress}
      className={baseClassName}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
        opacity: pressed ? 0.9 : 1,
      })}
      {...props}
    >
      {content}
    </Pressable>
  );
}

export { buttonVariants };
export default Button;
