import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface RestorePurchaseButtonProps {
  onPress: () => void;
  isLoading: boolean;
}

const RestorePurchaseButton: React.FC<RestorePurchaseButtonProps> = ({
  onPress,
  isLoading,
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.6}
      testID="restore-purchase-button"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>
          Restore Purchase
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default RestorePurchaseButton;