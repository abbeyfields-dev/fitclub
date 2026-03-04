import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const DURATION = 400;
const TRANSLATE_Y = 16;

export function useAuthScreenEnterAnimation() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(TRANSLATE_Y)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return {
    opacity,
    transform: [{ translateY }],
  };
}
