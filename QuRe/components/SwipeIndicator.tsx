import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SwipeIndicatorProps {
  autoHideDuration?: number;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ autoHideDuration = 5000 }) => {
  // Animation values
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const leftArrowAnim = useRef(new Animated.Value(0)).current;
  const rightArrowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance animation like a notification sliding in
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Arrow animation - subtle pulsing
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftArrowAnim, {
            toValue: -3,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(rightArrowAnim, {
            toValue: 3,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.parallel([
          Animated.timing(leftArrowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(rightArrowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ])
    ).start();

    // Exit animation after duration - slide out and fade
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: -20,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [translateYAnim, opacityAnim, leftArrowAnim, rightArrowAnim, autoHideDuration]);

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.notificationIcon}>
        <Animated.View style={{ transform: [{ translateX: leftArrowAnim }] }}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Animated.View>
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>Swipe to change background</Text>
        <Text style={styles.notificationText}>Change gradient colors</Text>
      </View>
      
      <View style={styles.notificationIcon}>
        <Animated.View style={{ transform: [{ translateX: rightArrowAnim }] }}>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notification: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    width: '81%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    // Removed alignItems: 'center' to allow text to align naturally to the left
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginBottom: 3,
  },
  notificationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default SwipeIndicator;