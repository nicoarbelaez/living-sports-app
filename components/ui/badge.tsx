import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
      destructive: 'bg-destructive',
      outline: 'border border-border',
    },
  },
  defaultVariants: { variant: 'default' },
});

const badgeTextVariants = cva('text-xs font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-white',
      outline: 'text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}

const Badge = React.forwardRef<View, BadgeProps>(
  ({ variant, className, children, ...props }, ref) => (
    <View ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={badgeTextVariants({ variant })}>{children}</Text>
    </View>
  )
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
