import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SwipeIndicatorProps {
  autoHideDuration?: number; // Time in ms before the indicator auto-hides
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ autoHideDuration = 4000 }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideLeftAnim = useRef(new Animated.Value(-10)).current;
  const slideRightAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Sequence of animations
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    });

    const scaleUp = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    });

    // Continuous glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );

    // Swipe hint animations
    const slideLeft = Animated.loop(
      Animated.sequence([
        Animated.timing(slideLeftAnim, {
          toValue: -20,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
        Animated.timing(slideLeftAnim, {
          toValue: -10,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
      ])
    );

    const slideRight = Animated.loop(
      Animated.sequence([
        Animated.timing(slideRightAnim, {
          toValue: 20,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
        Animated.timing(slideRightAnim, {
          toValue: 10,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
      ])
    );

    // Auto hide animation
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      delay: autoHideDuration - 800, // Start fading out just before the end
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    });

    // Start all animations
    Animated.parallel([fadeIn, scaleUp, glowAnimation, slideLeft, slideRight]).start();
    
    // Start the fade out after a delay
    fadeOut.start();

    // Clean up animations on unmount
    return () => {
      fadeOut.stop();
      glowAnimation.stop();
      slideLeft.stop();
      slideRight.stop();
    };
  }, [fadeAnim, scaleAnim, glowAnim, slideLeftAnim, slideRightAnim, autoHideDuration]);

  // Calculate the shadow and glow effects based on glowAnim
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      <View style={styles.content}>
        {/* Left swipe indicator */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              transform: [{ translateX: slideLeftAnim }],
              shadowOpacity,
              shadowRadius,
            }
          ]}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
          <Text style={styles.directionText}>Swipe</Text>
        </Animated.View>

        {/* Text in the middle */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              shadowOpacity,
              shadowRadius,
            }
          ]}
        >
          <Text style={styles.changeText}>change background</Text>
        </Animated.View>

        {/* Right swipe indicator */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              transform: [{ translateX: slideRightAnim }],
              shadowOpacity,
              shadowRadius,
            }
          ]}
        >
          <Text style={styles.directionText}>Swipe</Text>
          <Ionicons name="chevron-forward" size={28} color="#fff" />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -50, // Offset to position in the middle
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    pointerEvents: 'none', // Ensure it doesn't block touch events
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
  },
  textContainer: {
    paddingHorizontal: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
  },
  directionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  changeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  }
});

export default SwipeIndicator;