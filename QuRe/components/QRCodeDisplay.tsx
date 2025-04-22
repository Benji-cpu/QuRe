import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeDisplayProps {
  value: string; // Data for the QR code
  size: number; // Size of the QR code
  onPress?: () => void; // Add onPress prop for interaction
  isVisible?: boolean; // Prop to control visibility
  // Optional: Add color props later if needed
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size, onPress, isVisible = true }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Animated value for scale

  const handlePressIn = () => {
    // Scale down slightly on press in
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Spring back to original size on press out
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3, // Controls bounciness
      tension: 40, // Controls speed
      useNativeDriver: true,
    }).start();
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
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <QRCode
          value={value || 'https://example.com'} // Provide default value if empty
          size={size}
          // Default colors - can be customized via props later
          // color="black"
          // backgroundColor="white"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // Basic styling, will be refined
    alignItems: 'center',
    justifyContent: 'center',
    // Add some padding if needed so shadow/scale doesn't get cut off
    padding: 5,
  },
});

export default QRCodeDisplay; 