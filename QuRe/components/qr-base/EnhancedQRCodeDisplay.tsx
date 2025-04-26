import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { QRCodeGenerator } from '@/components/qr-base';

interface EnhancedQRCodeDisplayProps {
  value: string;
  size: number;
  onPress?: () => void;
  isVisible?: boolean;
  styleOptions?: any;
  isPremium?: boolean;
}

const EnhancedQRCodeDisplay: React.FC<EnhancedQRCodeDisplayProps> = ({ 
  value, 
  size, 
  onPress, 
  isVisible = true,
  styleOptions,
  isPremium = false
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(2)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
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
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(shadowAnim, {
        toValue: 2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    onPress?.();
  };

  const getBgColor = () => {
    if (!styleOptions) {
      return 'white';
    }
    
    const options = styleOptions.options || styleOptions;
    
    return options.backgroundOptions?.color === 'transparent' 
      ? 'transparent'
      : options.backgroundOptions?.color || 'white';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
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
          }),
          backgroundColor: getBgColor()
        }
      ]}>
        <QRCodeGenerator
          value={value || 'https://example.com'}
          size={size}
          styleOptions={styleOptions}
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

export default EnhancedQRCodeDisplay;