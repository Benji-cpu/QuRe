import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/useThemeColor';
import { formatPrice } from '@/context/PricingStrategy';

interface PricingDisplayProps {
  originalPrice: number;
  currentPrice: number;
  discount: number | null;
  label: string | null;
}

const PricingDisplay: React.FC<PricingDisplayProps> = ({
  originalPrice,
  currentPrice,
  discount,
  label,
}) => {
  const textColor = useThemeColor({}, 'text');
  const discountColor = useThemeColor({ light: '#ef4444', dark: '#f87171' }, 'text');
  const accentColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { backgroundColor: accentColor }]}>{label}</Text>}
      <View style={styles.priceContainer}>
        {discount !== null && (
          <Text style={[styles.originalPrice, { color: textColor }]}>
            {formatPrice(originalPrice)}
          </Text>
        )}
        <Text style={[styles.currentPrice, { color: textColor }]}>
          {formatPrice(currentPrice)}
        </Text>
      </View>
      {discount !== null && (
        <Text style={[styles.discountText, { color: discountColor }]}>
          Save {discount}%!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  label: {
    position: 'absolute',
    top: -12,
    left: 15,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginRight: 8,
    opacity: 0.7,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PricingDisplay;