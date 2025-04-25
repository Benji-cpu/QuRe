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

  // Add more logging to debug gesture handling
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
      setGradientIndexState(validNewIndex);
      console.log(`[useSwipeGradient] Starting fade in.`);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
          console.log(`[useSwipeGradient] Fade in complete for index: ${validNewIndex}`);
      });
    });
  };

  const swipeGesture = Gesture.Pan()
    .runOnJS(true) // Make sure we're running on JS thread
    .activateAfterLongPress(0) // No long press required
    .activeOffsetX([-20, 20]) // Detect horizontal drags
    .failOffsetY([-50, 50]) // But not if vertical drag is too much
    .onBegin(() => {
      console.log('[useSwipeGradient] Gesture begin detected');
    })
    .onUpdate((event) => {
      console.log(`[useSwipeGradient] Gesture update: velocityX=${event.velocityX}, translationX=${event.translationX}`);
    })
    .onEnd((event) => {
      console.log(`[useSwipeGradient] Gesture end: velocityX=${event.velocityX}, translationX=${event.translationX}`);
      
      const { velocityX, translationX } = event;
      
      if (Math.abs(velocityX) > 50 || Math.abs(translationX) > 40) {
        const currentIndex = gradientIndex;
        let newIndex;
        
        if (velocityX > 0 || (velocityX === 0 && translationX > 40)) {
          // Swipe right - go to previous gradient
          newIndex = (currentIndex - 1 + numGradients) % numGradients;
          console.log(`[useSwipeGradient] Swipe RIGHT detected: ${currentIndex} -> ${newIndex}`);
        } else {
          // Swipe left - go to next gradient
          newIndex = (currentIndex + 1) % numGradients;
          console.log(`[useSwipeGradient] Swipe LEFT detected: ${currentIndex} -> ${newIndex}`);
        }
        
        // Apply haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(err => {
          console.log('[useSwipeGradient] Haptic error:', err);
        });
        
        // Update gradient
        updateGradientIndex(newIndex);
      } else {
        console.log('[useSwipeGradient] Swipe too small, not changing gradient');
      }
    });

  const currentGradient = useMemo(() => {
    console.log(`[useSwipeGradient] Getting gradient for index: ${gradientIndex}`);
    const currentGradientKey = gradientKeys[gradientIndex];
    return Gradients[currentGradientKey];
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
    gradientIndex,
    opacityAnim,
    gesture: swipeGesture,
    gradientKeys,
    setGradientIndex,
  };
}