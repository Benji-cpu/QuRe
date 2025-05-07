import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPriceForRejectionCount } from './PricingStrategy';
import { Alert, Platform } from 'react-native';

const PREMIUM_STATUS_KEY = 'qure_premium_status';
const REJECTION_COUNT_KEY = 'qure_offer_rejections';
const LAST_OFFER_TIMESTAMP_KEY = 'qure_last_offer_timestamp';
const SESSIONS_COUNT_KEY = 'qure_session_count';

interface PremiumState {
  isPremium: boolean;
  rejectionCount: number;
  hasViewedOffer: boolean;
  lastOfferTimestamp: number | null;
  sessionCount: number;
  isLoading: boolean;
}

interface PremiumContextType extends PremiumState {
  checkPremiumStatus: () => Promise<boolean>;
  upgradeToPremium: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  trackOfferRejection: () => void;
  getCurrentPrice: () => { price: number; discount: number | null; label: string | null };
  resetRejectionCount: () => void;
  incrementSessionCount: () => Promise<void>;
  shouldShowOffer: (trigger: 'qr-add' | 'branding-removal' | 'session' | 'generation') => boolean;
  // --- Test Functions ---
  forceUpgrade: () => void;
  forceDowngrade: () => void;
}

// Initial state
const initialState: PremiumState = {
  isPremium: false,
  rejectionCount: 0,
  hasViewedOffer: false,
  lastOfferTimestamp: null,
  sessionCount: 0,
  isLoading: true,
};

// Create context
const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PremiumState>(initialState);

  // Load saved premium state on initial render
  useEffect(() => {
    const loadPremiumState = async () => {
      try {
        // Load premium status
        const premiumStatus = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
        const isPremium = premiumStatus === 'true';
        
        // Load rejection count
        const rejectionCountStr = await AsyncStorage.getItem(REJECTION_COUNT_KEY);
        const rejectionCount = rejectionCountStr ? parseInt(rejectionCountStr, 10) : 0;
        
        // Load last offer timestamp
        const lastOfferTimestampStr = await AsyncStorage.getItem(LAST_OFFER_TIMESTAMP_KEY);
        const lastOfferTimestamp = lastOfferTimestampStr ? parseInt(lastOfferTimestampStr, 10) : null;
        
        // Load session count
        const sessionCountStr = await AsyncStorage.getItem(SESSIONS_COUNT_KEY);
        const sessionCount = sessionCountStr ? parseInt(sessionCountStr, 10) : 0;
        
        setState(prev => ({
          ...prev,
          isPremium,
          rejectionCount,
          lastOfferTimestamp,
          sessionCount,
          isLoading: false,
        }));
        
        // Increment session count on app start
        incrementSessionCount();
        
      } catch (error) {
        console.error('Failed to load premium state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    loadPremiumState();
  }, []);
  
  // Save state to storage whenever it changes
  useEffect(() => {
    const savePremiumState = async () => {
      if (state.isLoading) return;
      
      try {
        await AsyncStorage.setItem(PREMIUM_STATUS_KEY, state.isPremium ? 'true' : 'false');
        await AsyncStorage.setItem(REJECTION_COUNT_KEY, state.rejectionCount.toString());
        
        if (state.lastOfferTimestamp) {
          await AsyncStorage.setItem(LAST_OFFER_TIMESTAMP_KEY, state.lastOfferTimestamp.toString());
        }
        
        await AsyncStorage.setItem(SESSIONS_COUNT_KEY, state.sessionCount.toString());
      } catch (error) {
        console.error('Failed to save premium state:', error);
      }
    };
    
    savePremiumState();
  }, [state.isPremium, state.rejectionCount, state.lastOfferTimestamp, state.sessionCount]);
  
  // --- TESTING FUNCTIONS --- 
  const forceUpgrade = () => {
    console.log('[TEST] Forcing Premium Upgrade');
    setState(prev => ({ ...prev, isPremium: true }));
    // Note: AsyncStorage update happens via the useEffect above
  };

  const forceDowngrade = () => {
    console.log('[TEST] Forcing Premium Downgrade (Free Tier)');
    setState(prev => ({ ...prev, isPremium: false }));
    // Note: AsyncStorage update happens via the useEffect above
  };
  // --- END TESTING FUNCTIONS ---

  // Check premium status (would connect to actual IAP verification in a real app)
  const checkPremiumStatus = async (): Promise<boolean> => {
    // In a real app, this would validate receipt with App Store/Google Play
    // For this demo, we just check local storage
    try {
      const status = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      const isPremium = status === 'true';
      
      setState(prev => ({ ...prev, isPremium }));
      return isPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  };
  
  // Upgrade to premium (simulated purchase flow)
  const upgradeToPremium = async (): Promise<boolean> => {
    try {
      // In a real app, this would initialize the purchase flow with IAP
      
      // Simulate a successful purchase
      setState(prev => ({ ...prev, isPremium: true }));
      await AsyncStorage.setItem(PREMIUM_STATUS_KEY, 'true');
      
      return true;
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
      
      // Show error alert
      Alert.alert(
        "Purchase Failed",
        "There was an error processing your purchase. Please try again later.",
        [{ text: "OK" }]
      );
      
      return false;
    }
  };
  
  // Restore purchases
  const restorePurchases = async (): Promise<boolean> => {
    try {
      // In a real app, this would verify previous purchases with the store
      
      // For demo purposes, just check if premium was previously set
      const status = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      const isPremium = status === 'true';
      
      if (isPremium) {
        setState(prev => ({ ...prev, isPremium: true }));
        Alert.alert("Success", "Your premium features have been restored!");
        return true;
      } else {
        Alert.alert("No Purchase Found", "We couldn't find any previous purchases to restore.");
        return false;
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      
      Alert.alert(
        "Restore Failed",
        "There was an error restoring your purchases. Please try again later.",
        [{ text: "OK" }]
      );
      
      return false;
    }
  };
  
  // Track offer rejection to adjust pricing
  const trackOfferRejection = () => {
    // Only increment if we haven't reached the max rejection count
    if (state.rejectionCount < 2) {
      setState(prev => ({
        ...prev,
        rejectionCount: prev.rejectionCount + 1,
        hasViewedOffer: true,
        lastOfferTimestamp: Date.now(),
      }));
    }
  };
  
  // Get current price based on rejection count
  const getCurrentPrice = () => {
    return getPriceForRejectionCount(state.rejectionCount);
  };
  
  // Reset rejection count (used for testing or after a significant app update)
  const resetRejectionCount = () => {
    setState(prev => ({
      ...prev,
      rejectionCount: 0,
      hasViewedOffer: false,
      lastOfferTimestamp: null,
    }));
  };
  
  // Increment session count
  const incrementSessionCount = async (): Promise<void> => {
    const newCount = state.sessionCount + 1;
    setState(prev => ({ ...prev, sessionCount: newCount }));
    
    try {
      await AsyncStorage.setItem(SESSIONS_COUNT_KEY, newCount.toString());
    } catch (error) {
      console.error('Failed to save session count:', error);
    }
  };
  
  // Determine if we should show an offer based on context
  const shouldShowOffer = (trigger: 'qr-add' | 'branding-removal' | 'session' | 'generation'): boolean => {
    // If already premium, don't show offers
    if (state.isPremium) return false;
    
    // Check cooldown period (don't show offers too frequently)
    const now = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
    
    if (state.lastOfferTimestamp && (now - state.lastOfferTimestamp) < cooldownPeriod) {
      // If it's been less than the cooldown period, only show for high-value triggers
      if (trigger !== 'qr-add' && trigger !== 'branding-removal') {
        return false;
      }
    }
    
    // Logic for each trigger type
    switch (trigger) {
      case 'qr-add':
        // Always show when adding a second QR code
        return true;
        
      case 'branding-removal':
        // Always show when attempting to remove branding
        return true;
        
      case 'session':
        // Show after 3+ sessions if rejection count is low
        return state.sessionCount >= 3 && state.rejectionCount < 2;
        
      case 'generation':
        // Show after generating a QR code if we haven't shown too many offers
        return state.rejectionCount < 2;
        
      default:
        return false;
    }
  };
  
  // Context value
  const contextValue: PremiumContextType = {
    ...state,
    checkPremiumStatus,
    upgradeToPremium,
    restorePurchases,
    trackOfferRejection,
    getCurrentPrice,
    resetRejectionCount,
    incrementSessionCount,
    shouldShowOffer,
    // --- Test Functions ---
    forceUpgrade,
    forceDowngrade,
  };
  
  return (
    <PremiumContext.Provider value={contextValue}>
      {children}
    </PremiumContext.Provider>
  );
};

// Hook for using premium context
export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  
  return context;
};