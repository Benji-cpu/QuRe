import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SwipeIndicatorProps {
  autoHideDuration?: number;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ autoHideDuration = 5000 }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const leftArrowAnim = useRef(new Animated.Value(-5)).current;
  const rightArrowAnim = useRef(new Animated.Value(5)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Arrow animation - repeating
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftArrowAnim, {
            toValue: -15,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(rightArrowAnim, {
            toValue: 15,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.parallel([
          Animated.timing(leftArrowAnim, {
            toValue: -5,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(rightArrowAnim, {
            toValue: 5,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ])
    ).start();

    // Exit animation after duration
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [fadeAnim, scaleAnim, leftArrowAnim, rightArrowAnim, autoHideDuration]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        {/* Left arrow with animation */}
        <Animated.View
          style={{
            transform: [{ translateX: leftArrowAnim }],
          }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </Animated.View>

        {/* Text */}
        <Text style={styles.text}>Swipe to change background</Text>

        {/* Right arrow with animation */}
        <Animated.View
          style={{
            transform: [{ translateX: rightArrowAnim }],
          }}
        >
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -width * 0.4,
    width: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // Shadow defined in style object, not directly on Animated.View
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default SwipeIndicator;