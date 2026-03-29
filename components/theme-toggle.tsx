import { useEffect } from 'react';
import { Appearance, Pressable, useColorScheme } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';

export default function ThemeToggle() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animación de rotación
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isDark ? 180 : 0, {
      damping: 50,
      stiffness: 150,
    });
  }, [isDark, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Pressable
      onPress={toggle}
      className="active:opacity-70"
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <Animated.View
        key={isDark ? 'moon' : 'sun'}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={animatedIconStyle}
        className="from-background to-secondary h-12 w-12 items-center justify-center rounded-full bg-linear-to-br shadow-md"
      >
        <Feather
          className="rotate-12"
          name={isDark ? 'moon' : 'sun'}
          size={24}
          color={isDark ? '#fbbf24' : '#f59e0b'}
        />
      </Animated.View>
    </Pressable>
  );
}
