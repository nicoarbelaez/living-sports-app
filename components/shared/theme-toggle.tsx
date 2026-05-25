import { Appearance, Pressable, useColorScheme } from 'react-native';
import { useEffect } from 'react';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import Feather from '@expo/vector-icons/Feather';

const SWITCH_WIDTH = 58;
const SWITCH_HEIGHT = 32;

const THUMB_SIZE = 26;
const PADDING = 3;

const MAX_TRANSLATE = SWITCH_WIDTH - THUMB_SIZE - PADDING * 2;

export default function ThemeToggle() {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, {
      damping: 14,
      stiffness: 180,
      mass: 0.8,
    });
  }, [isDark, progress]);

  const trackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [
          '#e2f6d5', // primary-neutral light
          '#1e3512', // primary-pale dark
        ]
      ),
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: progress.value * MAX_TRANSLATE,
        },
      ],

      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [
          '#9fe870', // primary
          '#cdffad', // primary-active
        ]
      ),
    };
  });

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Pressable onPress={toggleTheme} hitSlop={8} className="active:opacity-80">
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
              alignItems: 'center',
              justifyContent: 'center',
            },
            thumbStyle,
          ]}
        >
          <Feather name={isDark ? 'moon' : 'sun'} size={14} color="#0e0f0c" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
