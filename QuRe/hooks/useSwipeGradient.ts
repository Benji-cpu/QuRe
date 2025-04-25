import { useState, useEffect, useRef, useMemo } from 'react';
import { Animated } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Gradients } from '@/constants/Colors';

const gradientKeys = Object.keys(Gradients);
const numGradients = gradientKeys.length;

export function useSwipeGradient() {
  const [gradientIndex, setGradientIndexState] = useState(0);
  const [previousGradientIndex, setPreviousGradientIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const lastSwipeTime = useRef(Date.now());
  const isAnimating = useRef(false);

  // Improve gradient transition with cross-fade animation
  const updateGradientIndex = (newIndex: number) => {
    if (typeof newIndex !== 'number' || !Number.isInteger(newIndex)) {
      console.error(`[useSwipeGradient] updateGradientIndex received invalid index: ${newIndex}, type: ${typeof newIndex}`);
      return;
    }
    
    const validNewIndex = (newIndex % numGradients + numGradients) % numGradients;
    if (validNewIndex === gradientIndex || isAnimating.current) {
      return;
    }
    
    isAnimating.current = true;
    setPreviousGradientIndex(gradientIndex);
    
    // Start with current gradient fully visible (opacity 1)
    // Then fade to new gradient by animating opacity to 0
    // The new gradient will be beneath with opacity 1
    
    // Reset opacity to 1 before starting animation
    opacityAnim.setValue(1);
    
    // Standard animation for cross-fade
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setGradientIndexState(validNewIndex);
      // Reset opacity to 1 for next animation
      opacityAnim.setValue(1);
      isAnimating.current = false;
    });
    
    lastSwipeTime.current = Date.now();
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

  const previousGradient = useMemo(() => {
    const prevGradientKey = gradientKeys[previousGradientIndex];
    return Gradients[prevGradientKey];
  }, [previousGradientIndex]);

  const setGradientIndex = (index: number) => {
    if (typeof index === 'number' && index >= 0 && index < numGradients) {
      updateGradientIndex(index);
    } else {
      console.warn(`[useSwipeGradient] Invalid index passed to setGradientIndex: ${index}`)
    }
  };

  return {
    gradient: currentGradient,
    previousGradient,
    gradientIndex,
    previousGradientIndex,
    opacityAnim,
    gesture: swipeGesture,
    gradientKeys,
    setGradientIndex,
  };
}