import { Appearance, Pressable, useColorScheme } from 'react-native';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useEffect } from 'react';

import Feather from '@expo/vector-icons/Feather';

const SWITCH_WIDTH = 58;
const SWITCH_HEIGHT = 32;

const THUMB_SIZE = 26;
const PADDING = 3;

export default function ThemeToggle() {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  const translateX = useSharedValue(isDark ? SWITCH_WIDTH - THUMB_SIZE - PADDING * 2 : 0);

  useEffect(() => {
    translateX.value = withSpring(isDark ? SWITCH_WIDTH - THUMB_SIZE - PADDING * 2 : 0, {
      damping: 12,
      stiffness: 140,
      mass: 0.8,
      overshootClamping: false,
    });
  }, [isDark]);

  const trackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [0, SWITCH_WIDTH - THUMB_SIZE - PADDING * 2],
        ['#27272a', '#3f3f46']
      ),
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Pressable onPress={toggleTheme} className="active:opacity-80">
      <Animated.View
        style={[
          {
            width: SWITCH_WIDTH,
            height: SWITCH_HEIGHT,
            borderRadius: SWITCH_HEIGHT / 2,
            padding: PADDING,
            justifyContent: 'center',
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
            },
            thumbStyle,
          ]}
        >
          <Feather name={isDark ? 'moon' : 'sun'} size={14} color="#18181b" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
