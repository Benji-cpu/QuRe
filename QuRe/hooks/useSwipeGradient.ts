import { useState, useEffect, useRef, useMemo } from 'react';
import { Animated } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Gradients } from '@/constants/Colors';

const gradientKeys = Object.keys(Gradients);
const numGradients = gradientKeys.length;

export function useSwipeGradient() {
  const [gradientIndex, setGradientIndexState] = useState(0);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const lastSwipeTime = useRef(Date.now());

  // Improve gradient transition with a better fade animation
  const updateGradientIndex = (newIndex: number) => {
    if (typeof newIndex !== 'number' || !Number.isInteger(newIndex)) {
      console.error(`[useSwipeGradient] updateGradientIndex received invalid index: ${newIndex}, type: ${typeof newIndex}`);
      return;
    }
    
    const validNewIndex = (newIndex % numGradients + numGradients) % numGradients;
    if (validNewIndex === gradientIndex) {
      return;
    }

    // Throttle the animation to prevent rapid swipes from causing visual glitches
    const now = Date.now();
    if (now - lastSwipeTime.current < 200) {
      Animated.spring(opacityAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start(() => {
        setGradientIndexState(validNewIndex);
        Animated.spring(opacityAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      });
    } else {
      // Standard animation for normal paced swipes
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setGradientIndexState(validNewIndex);
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }
    
    lastSwipeTime.current = now;
  };

  // Enhanced swipe gesture with better haptic feedback
  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(0)
    .activeOffsetX([-20, 20])
    .failOffsetY([-50, 50])
    .onEnd((event) => {
      const { velocityX, translationX } = event;
      
      if (Math.abs(velocityX) > 50 || Math.abs(translationX) > 40) {
        const currentIndex = gradientIndex;
        let newIndex;
        
        if (velocityX > 0 || (velocityX === 0 && translationX > 40)) {
          // Swipe right - go to previous gradient
          newIndex = (currentIndex - 1 + numGradients) % numGradients;
          
          // Adjust haptic intensity based on swipe velocity
          if (Math.abs(velocityX) > 300) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } else {
          // Swipe left - go to next gradient
          newIndex = (currentIndex + 1) % numGradients;
          
          // Adjust haptic intensity based on swipe velocity
          if (Math.abs(velocityX) > 300) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
        
        // Update gradient
        updateGradientIndex(newIndex);
      }
    });

  const currentGradient = useMemo(() => {
    const currentGradientKey = gradientKeys[gradientIndex];
    return Gradients[currentGradientKey];
  }, [gradientIndex]);

  const setGradientIndex = (index: number) => {
    if (typeof index === 'number' && index >= 0 && index < numGradients) {
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