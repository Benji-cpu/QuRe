import { useState, useRef, useMemo } from 'react';
import { Animated } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Gradients } from '@/constants/Colors';

const gradientKeys = Object.keys(Gradients);
const numGradients = gradientKeys.length;

export function useSwipeGradient() {
  // Keep track of current and next gradient indexes
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const [nextGradientIndex, setNextGradientIndex] = useState(0); // Initially same as current
  
  // Animation value for cross-fading between gradients
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const updateGradientIndex = (newIndex: number) => {
    if (typeof newIndex !== 'number' || !Number.isInteger(newIndex)) {
      console.error(`[useSwipeGradient] updateGradientIndex received invalid index: ${newIndex}, type: ${typeof newIndex}`);
      return;
    }
    
    const validNewIndex = (newIndex % numGradients + numGradients) % numGradients;
    
    if (validNewIndex === currentGradientIndex) {
      return;
    }

    // Set the next gradient index first
    setNextGradientIndex(validNewIndex);
    
    // Reset the fade animation to 0 (showing current gradient)
    fadeAnim.setValue(0);
    
    // Animate to 1 (showing next gradient)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, // Slightly longer for smoother transition
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Only update current index when animation is finished
      if (finished) {
        setCurrentGradientIndex(validNewIndex);
        // Reset the fade animation for next transition
        fadeAnim.setValue(0);
      }
    });
  };

  const logSwipe = (direction: string, targetIndex: number) => {
    console.log(`[useSwipeGradient] Swipe: ${direction} -> index ${targetIndex}`);
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      'worklet';
      const { velocityX, translationX } = event;
      if (Math.abs(velocityX) > 50 || Math.abs(translationX) > 40) {
        const currentIndex = currentGradientIndex;
        if (velocityX > 0 || (velocityX === 0 && translationX > 40)) {
           const newIndex = (currentIndex - 1 + numGradients) % numGradients;
           runOnJS(logSwipe)('right', newIndex);
           runOnJS(updateGradientIndex)(newIndex);
        } else {
           const newIndex = (currentIndex + 1) % numGradients;
           runOnJS(logSwipe)('left', newIndex);
           runOnJS(updateGradientIndex)(newIndex);
        }
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  // Current gradient derived from currentGradientIndex
  const currentGradient = useMemo(() => {
    const currentGradientKey = gradientKeys[currentGradientIndex];
    return Gradients[currentGradientKey];
  }, [currentGradientIndex]);

  // Next gradient derived from nextGradientIndex
  const nextGradient = useMemo(() => {
    const nextGradientKey = gradientKeys[nextGradientIndex];
    return Gradients[nextGradientKey];
  }, [nextGradientIndex]);

  const setGradientIndex = (index: number) => {
    if (typeof index === 'number' && index >= 0 && index < numGradients) {
      console.log(`[useSwipeGradient] Setting index externally to: ${index}`);
      updateGradientIndex(index);
    } else {
      console.warn(`[useSwipeGradient] Invalid index passed to setGradientIndex: ${index}`)
    }
  };

  return {
    currentGradient,
    nextGradient,
    fadeAnim, // Animation value for cross-fade
    gradientIndex: currentGradientIndex,
    gesture: swipeGesture,
    gradientKeys,
    setGradientIndex,
  };
}