import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { usePremium } from '@/context/PremiumContext';
import { getPlatformSpecificProductId } from '@/context/PricingStrategy';
import * as Haptics from 'expo-haptics';

export interface PurchaseOptions {
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
}

interface UsePurchaseReturn {
  isPurchasing: boolean;
  initiatePurchase: (options?: PurchaseOptions) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export const usePurchase = (): UsePurchaseReturn => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { upgradeToPremium, restorePurchases: restorePremium } = usePremium();
  
  const initiatePurchase = async (options?: PurchaseOptions) => {
    if (isPurchasing) return;
    
    try {
      setIsPurchasing(true);
      
      // In a real app, this would connect to the App Store/Google Play
      // For this demo, we use a simulated flow
      
      // Provide haptic feedback when purchase starts
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Attempt upgrade
      const success = await upgradeToPremium();
      
      if (success) {
        // Purchase successful
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        options?.onSuccess?.();
        
        Alert.alert(
          "Purchase Successful",
          "Thank you for upgrading to QuRe Premium! All premium features are now unlocked.",
          [{ text: "Great!" }]
        );
      } else {
        // Purchase failed
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const errorMsg = "Transaction could not be completed";
        options?.onFailure?.(errorMsg);
      }
    } catch (error) {
      // Handle purchase errors
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Purchase error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      options?.onFailure?.(errorMessage);
      
      Alert.alert(
        "Purchase Failed",
        "There was an error processing your purchase. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const restorePurchases = async () => {
    if (isPurchasing) return;
    
    try {
      setIsPurchasing(true);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt to restore purchases
      await restorePremium();
      
    } catch (error) {
      console.error('Restore error:', error);
      
      Alert.alert(
        "Restore Failed",
        "There was an error restoring your purchases. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };
  
  return {
    isPurchasing,
    initiatePurchase,
    restorePurchases
  };
};

export default usePurchase;