import { Platform } from 'react-native';

export interface PriceTier {
  price: number;
  discount: number | null;
  label: string | null;
}

export const BASE_PRICE = 4.99;

export const PRICE_TIERS: PriceTier[] = [
  { price: 4.99, discount: null, label: null },
  { price: 3.99, discount: 20, label: 'Limited Time Offer' },
  { price: 2.99, discount: 40, label: 'Final Offer' }
];

export const getPriceForRejectionCount = (rejectionCount: number): PriceTier => {
  const tierIndex = Math.min(rejectionCount, PRICE_TIERS.length - 1);
  return PRICE_TIERS[tierIndex];
};

export const formatPrice = (price: number): string => {
  // Format price based on platform and locale
  // This is a simplified implementation
  return `$${price.toFixed(2)}`;
};

export const getPlatformSpecificProductId = (): string => {
  // In a real app, you would have different product IDs for iOS and Android
  if (Platform.OS === 'ios') {
    return 'com.qure.app.premium';
  } else {
    return 'com.qure.app.premium';
  }
};

export const calculateSavings = (originalPrice: number, discountedPrice: number): string => {
  const savings = originalPrice - discountedPrice;
  return formatPrice(savings);
};