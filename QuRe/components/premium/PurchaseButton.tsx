import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import { formatPrice } from '@/context/PricingStrategy';

interface PurchaseButtonProps {
  price: number;
  isLoading: boolean;
  onPress: () => void;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  price,
  isLoading,
  onPress,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Pulse animation for the button
  useEffect(() => {
    // Create sequential animation
    const pulseAnimation = Animated.sequence([
      // Wait a bit before starting
      Animated.delay(1000),
      // Scale up slightly
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: false,
      }),
      // Scale back down
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]);
    
    // Create glow animation
    const glowAnimation = Animated.sequence([
      // Wait a bit before starting
      Animated.delay(1000),
      // Increase glow
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      // Decrease glow
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }),
    ]);
    
    // Loop the animations
    Animated.loop(
      Animated.parallel([pulseAnimation, glowAnimation]),
      { iterations: 3 } // Pulse 3 times
    ).start();
  }, []);
  
  // Interpolate glow value to shadow properties
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 8],
  });
  
  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          transform: [{ scale: scaleAnim }],
          shadowOpacity,
          shadowRadius,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Upgrade Now</Text>
            <Text style={styles.priceText}>
              {formatPrice(price)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderRadius: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  priceText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PurchaseButton;