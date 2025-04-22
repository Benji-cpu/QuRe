import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Gradients } from '@/constants/Colors';

const gradientKeys = Object.keys(Gradients);
const numGradients = gradientKeys.length;

export function useSwipeGradient() {
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [internalGradientIndex, setInternalGradientIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Animation effect
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setInternalGradientIndex(currentGradientIndex);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [currentGradientIndex, opacityAnim]);

  // Gesture handler
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      const { velocityX } = event;
      if (Math.abs(velocityX) > 50) {
        if (velocityX > 0) { // Right swipe
          setCurrentGradientIndex((prev) => (prev - 1 + numGradients) % numGradients);
        } else { // Left swipe
          setCurrentGradientIndex((prev) => (prev + 1) % numGradients);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  const currentGradientKey = gradientKeys[internalGradientIndex];
  const currentGradient = Gradients[currentGradientKey];

  return {
    gradient: currentGradient,
    gradientIndex: currentGradientIndex,
    opacityAnim,
    gesture: swipeGesture,
    gradientKeys,
    setGradientIndex: setCurrentGradientIndex
  };
} 