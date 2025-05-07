import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { usePremium } from '@/context/PremiumContext';
import { getPlatformSpecificProductId } from '@/context/PricingStrategy';
import * as Haptics from 'expo-haptics';
import PurchaseService from '@/services/PurchaseService';

export interface PurchaseOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export interface UsePurchaseReturn {
  isPurchasing: boolean;
  isRestoring: boolean;
  initiatePurchase: (options?: PurchaseOptions) => Promise<void>;
  restorePurchases: (options?: PurchaseOptions) => Promise<void>;
}

export function usePurchase(): UsePurchaseReturn {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { upgradeToPremium, restorePurchases: restorePremium, checkPremiumStatus } = usePremium();
  
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
        options?.onError?.(new Error(errorMsg));
      }
    } catch (error) {
      // Handle purchase errors
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Purchase error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      options?.onError?.(new Error(errorMessage));
      
      Alert.alert(
        "Purchase Failed",
        "There was an error processing your purchase. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const restorePurchases = async (options?: PurchaseOptions) => {
    if (isRestoring) return;
    setIsRestoring(true);
    console.log('[usePurchase] Initiating restore purchases...');

    try {
      const restored = await PurchaseService.restorePurchases();
      if (restored) {
        console.log('[usePurchase] Restore successful, checking premium status...');
        // Verify the purchase status with your backend/context
        const premiumActivated = await checkPremiumStatus(); 
        if(premiumActivated) {
            console.log('[usePurchase] Premium status confirmed after restore.');
            Alert.alert('Purchases Restored', 'Your previous purchases have been restored successfully.');
            options?.onSuccess?.();
        } else {
            console.warn('[usePurchase] Restore reported success, but premium check failed.');
            Alert.alert('Restore Issue', "Purchases were restored, but we couldn't verify premium access. Please contact support.");
            options?.onError?.(new Error('Premium verification failed after restore.'));
        }
      } else {
        console.log('[usePurchase] No purchases found to restore.');
        Alert.alert('No Purchases Found', "We couldn't find any previous purchases to restore for your account.");
        options?.onCancel?.(); // Use onCancel or a similar callback if needed
      }
    } catch (error: any) {
      console.error('[usePurchase] Error restoring purchases:', error);
      Alert.alert('Restore Error', `Failed to restore purchases: ${error.message}`);
      options?.onError?.(error);
    } finally {
      setIsRestoring(false);
    }
  };
  
  return {
    isPurchasing,
    isRestoring,
    initiatePurchase,
    restorePurchases,
  };
}

export default usePurchase;