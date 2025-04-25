import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';

interface QRCodeDisplayProps {
  value: string; // Data for the QR code
  size: number; // Size of the QR code
  onPress?: () => void; // Add onPress prop for interaction
  isVisible?: boolean; // Prop to control visibility
  customColor?: string; // Optional color for QR code
  backgroundColor?: string; // Optional background color for QR code
  isPremium?: boolean; // Optional flag to indicate if this is a premium feature
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size, 
  onPress, 
  isVisible = true,
  customColor = 'black',
  backgroundColor = 'white',
  isPremium = false
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Animated value for scale
  const shadowAnim = useRef(new Animated.Value(2)).current; // Animated value for shadow

  const handlePressIn = () => {
    // Provide haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate scale and shadow
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    // Spring back to original size on press out with a bounce effect
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3, // Controls bounciness
        tension: 40, // Controls speed
        useNativeDriver: true,
      }),
      Animated.spring(shadowAnim, {
        toValue: 2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    // Call the onPress prop if provided
    onPress?.();
  };

  // Conditionally render the component
  if (!isVisible) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8} // Adjust feedback opacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        styles.container, 
        { 
          transform: [{ scale: scaleAnim }],
          shadowOpacity: shadowAnim.interpolate({
            inputRange: [1, 2],
            outputRange: [0.1, 0.3]
          })
        }
      ]}>
        <QRCode
          value={value || 'https://example.com'} // Provide default value if empty
          size={size}
          color={customColor}
          backgroundColor={backgroundColor}
          // Logo would be implemented here for premium users once we have the logo asset
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
    backgroundColor: 'white',
    borderRadius: 8,
  },
});

export default QRCodeDisplay;