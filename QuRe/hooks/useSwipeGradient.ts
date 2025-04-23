import { useState, useEffect, useRef, useMemo } from 'react';
import { Animated } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Gradients } from '@/constants/Colors';

const gradientKeys = Object.keys(Gradients);
const numGradients = gradientKeys.length;

export function useSwipeGradient() {
  const [gradientIndex, setGradientIndexState] = useState(0);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const updateGradientIndex = (newIndex: number) => {
    if (typeof newIndex !== 'number' || !Number.isInteger(newIndex)) {
        console.error(`[useSwipeGradient] updateGradientIndex received invalid index: ${newIndex}, type: ${typeof newIndex}`);
        return;
    }
    const validNewIndex = (newIndex % numGradients + numGradients) % numGradients;

    if (validNewIndex === gradientIndex) {
        return;
    }

    console.log(`[useSwipeGradient] Starting update to index: ${validNewIndex}`);
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      console.log(`[useSwipeGradient] Fade out complete for index: ${validNewIndex}`);
      console.log(`[useSwipeGradient] Starting fade in.`);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
          console.log(`[useSwipeGradient] Fade in complete for index: ${validNewIndex}`);
      });
    });

    console.log(`[useSwipeGradient] Setting index state to: ${validNewIndex} (during fade out)`);
    setGradientIndexState(validNewIndex);
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
        const currentIndex = gradientIndex;
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

  const currentGradient = useMemo(() => {
    console.log(`[useSwipeGradient] Recalculating gradient for index: ${gradientIndex}`);
    const currentGradientKey = gradientKeys[gradientIndex];
    console.log(`[useSwipeGradient] Current key: ${currentGradientKey}`);
    const grad = Gradients[currentGradientKey];
    console.log(`[useSwipeGradient] Current gradient: ${JSON.stringify(grad)}`);
    return grad;
  }, [gradientIndex]);

  const setGradientIndex = (index: number) => {
      if (typeof index === 'number' && index >= 0 && index < numGradients) {
          console.log(`[useSwipeGradient] Setting index externally to: ${index}`);
          updateGradientIndex(index);
      } else {
          console.warn(`[useSwipeGradient] Invalid index passed to setGradientIndex: ${index}`)
      }
  };

  return {
    gradient: currentGradient,
    gradientIndex: gradientIndex,
    opacityAnim,
    gesture: swipeGesture,
    gradientKeys,
    setGradientIndex,
  };
} 