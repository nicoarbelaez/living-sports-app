import React, { ComponentProps } from 'react';
import { View } from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { MotiPressable as OriginalMotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollContext } from '@/providers/scroll-context';

// Add TypeScript support for className
type MotiPressableProps = ComponentProps<typeof OriginalMotiPressable> & {
  className?: string;
};

const MotiPressable = OriginalMotiPressable as React.FC<MotiPressableProps>;

export type FloatingNavbarProps = MaterialTopTabBarProps & {
  showPlusBottom?: boolean;
};

export function FloatingNavbar({
  state,
  descriptors: _descriptors,
  navigation,
  showPlusBottom = false,
}: FloatingNavbarProps) {
  const insets = useSafeAreaInsets();
  const { shouldHideNavbar } = useScrollContext();

  const onTabPress = (route: (typeof state.routes)[0], isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const getIconName = (name: string): keyof typeof MaterialIcons.glyphMap => {
    switch (name) {
      case 'index':
        return 'home';
      case 'comunidades':
        return 'groups';
      case 'profile':
        return 'person';
      default:
        return 'home';
    }
  };

  return (
    <MotiView
      className="absolute right-6 bottom-6 left-6 z-30 flex-row justify-center"
      style={{ marginBottom: insets.bottom > 0 ? insets.bottom / 2 : 0 }}
      animate={{
        translateY: shouldHideNavbar ? 150 : 0,
        opacity: shouldHideNavbar ? 0 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 12,
        stiffness: 90,
        mass: 1,
      }}
    >
      <View className="w-full flex-row items-center justify-around rounded-full border border-gray-100 bg-white/95 p-2 px-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800/95">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconName = getIconName(route.name);

          const showPlus = showPlusBottom ? index === 1 : false;

          return (
            <React.Fragment key={route.key}>
              <MotiPressable
                onPress={() => onTabPress(route, isFocused)}
                animate={({ hovered, pressed }) => {
                  'worklet';
                  return {
                    scale: hovered || pressed ? 1.15 : 1,
                    opacity: hovered || pressed ? 0.7 : 1,
                  };
                }}
                className="p-2"
              >
                <MaterialIcons
                  name={iconName}
                  size={30}
                  color={isFocused ? '#0a7ea4' : '#9BA1A6'}
                />
              </MotiPressable>

              {showPlus && (
                <MotiPressable
                  animate={({ hovered, pressed }) => {
                    'worklet';
                    return {
                      scale: hovered || pressed ? 1.1 : 1,
                    };
                  }}
                  className="-mt-12 rounded-2xl border-4 border-white bg-[#0a7ea4] p-4 shadow-xl shadow-[#0a7ea4]/30 dark:border-gray-800"
                  onPress={() => {
                    // Action button logic
                    console.log('Action Pressed');
                  }}
                >
                  <MaterialIcons name="add" size={32} color="white" />
                </MotiPressable>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </MotiView>
  );
}
