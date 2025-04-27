import React, { useRef, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import QRCodeGenerator from './QRCodeGenerator';
import { Ionicons } from '@expo/vector-icons';

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

  const getBgColor = useMemo(() => {
    if (!styleOptions) {
      return 'white';
    }
    
    const options = styleOptions.options || styleOptions;
    
    return options.backgroundOptions?.color === 'transparent' 
      ? 'transparent'
      : options.backgroundOptions?.color || 'white';
  }, [styleOptions]);

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
          backgroundColor: getBgColor
        }
      ]}>
        {!value ? (
          <View style={styles.placeholderContainer}>
            <Ionicons name="add-circle" size={size/2} color="#10b981" />
          </View>
        ) : (
          <QRCodeGenerator
            value={value}
            size={size}
            styleOptions={styleOptions}
          />
        )}
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
  placeholderContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default EnhancedQRCodeDisplay;