import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FREE_LIMITS = {
  maxQrCodes: 1,
  requiresBranding: true,
  allowsCustomStyles: false,
  maxGradients: 3,
};

const PREMIUM_FEATURES = {
  unlimitedQrCodes: true,
  noBranding: true,
  customStyles: true,
  allGradients: true,
};

export const PREMIUM_FEATURE_LIMITS = {
  FREE: FREE_LIMITS,
  PREMIUM: PREMIUM_FEATURES,
};

export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  free: boolean | number | string;
  premium: boolean | number | string;
}

export const PREMIUM_FEATURES_LIST: PremiumFeature[] = [
  {
    id: 'qrCodes',
    title: 'Custom QR Codes',
    description: 'Create custom QR codes for your lock screen',
    icon: '📱',
    free: '1',
    premium: 'Unlimited',
  },
  {
    id: 'branding',
    title: 'QuRe Branding',
    description: 'Remove QuRe branding from your lock screen',
    icon: '🏷️',
    free: 'Required',
    premium: 'No Branding',
  },
  {
    id: 'styles',
    title: 'QR Code Styles',
    description: 'Access premium QR code styles and colors',
    icon: '🎨',
    free: 'Basic',
    premium: 'Premium',
  },
  {
    id: 'backgrounds',
    title: 'Background Gradients',
    description: 'Beautiful background options for your lock screen',
    icon: '🌈',
    free: 'Limited',
    premium: 'All Gradients',
  },
];

// Check feature availability based on premium status
export const canUseFeature = (feature: string, isPremium: boolean): boolean | number => {
  const limits = isPremium ? PREMIUM_FEATURES : FREE_LIMITS;
  
  switch (feature) {
    case 'qrCodes':
      return isPremium ? Infinity : limits.maxQrCodes;
      
    case 'branding':
      return !limits.requiresBranding;
      
    case 'styles':
      return limits.allowsCustomStyles;
      
    case 'gradients':
      return isPremium ? Infinity : limits.maxGradients;
      
    default:
      return isPremium;
  }
};

// Get appropriate app store link
export const getAppStoreLink = (): string => {
  if (Platform.OS === 'ios') {
    return 'https://apps.apple.com/app/qure-qr-code-lockscreen/id1234567890';
  } else {
    return 'https://play.google.com/store/apps/details?id=com.qure.app';
  }
};

// Get premium purchase identifier
export const getPremiumProductId = (): string => {
  return Platform.OS === 'ios' 
    ? 'com.qure.app.premium' 
    : 'com.qure.app.premium';
};

// Calculate time since purchase
export const getTimeSincePurchase = async (): Promise<number | null> => {
  try {
    const purchaseDateStr = await AsyncStorage.getItem('qure_purchase_date');
    if (!purchaseDateStr) return null;
    
    const purchaseDate = parseInt(purchaseDateStr, 10);
    const now = Date.now();
    
    return now - purchaseDate;
  } catch (error) {
    console.error('Failed to get time since purchase:', error);
    return null;
  }
};

// Convert milliseconds to days
export const millisToDays = (millis: number): number => {
  return Math.floor(millis / (1000 * 60 * 60 * 24));
};