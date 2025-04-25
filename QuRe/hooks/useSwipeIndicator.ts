import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INDICATOR_SHOWN_KEY = 'swipe_indicator_shown';

interface UseSwipeIndicatorReturn {
  showIndicator: boolean;
  markIndicatorShown: () => Promise<void>;
}

export const useSwipeIndicator = (
  alwaysShowOnFirstLoad: boolean = true, // Changed default to true
  maxShownCount: number = 3
): UseSwipeIndicatorReturn => {
  const [showIndicator, setShowIndicator] = useState<boolean>(true); // Default to true for immediate visibility
  
  useEffect(() => {
    const checkIfShouldShow = async () => {
      try {
        // Get the stored indicator data
        const indicatorData = await AsyncStorage.getItem(INDICATOR_SHOWN_KEY);
        
        // If no data exists yet (first app launch), show indicator
        if (!indicatorData) {
          console.log('No indicator data found, showing indicator');
          setShowIndicator(true);
          return;
        }
        
        let data = JSON.parse(indicatorData);
        
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        // More aggressive conditions to ensure indicator is shown
        const showAgain = alwaysShowOnFirstLoad 
          || data.count < maxShownCount
          || (now - data.lastShown) > oneDayMs; // Show again after just 1 day
        
        console.log(`Should show indicator: ${showAgain}, count: ${data.count}, lastShown: ${new Date(data.lastShown)}`);
        setShowIndicator(showAgain);
      } catch (error) {
        console.error('Error checking swipe indicator state:', error);
        // If there's an error, show the indicator anyway
        setShowIndicator(true);
      }
    };
    
    checkIfShouldShow();
  }, [alwaysShowOnFirstLoad, maxShownCount]);
  
  const markIndicatorShown = async (): Promise<void> => {
    try {
      // Get the current data
      const indicatorData = await AsyncStorage.getItem(INDICATOR_SHOWN_KEY);
      let data = { count: 0, lastShown: 0 };
      
      if (indicatorData) {
        data = JSON.parse(indicatorData);
      }
      
      // Update the data
      data.count += 1;
      data.lastShown = Date.now();
      
      // Store the updated data
      await AsyncStorage.setItem(INDICATOR_SHOWN_KEY, JSON.stringify(data));
      console.log(`Indicator marked as shown, new count: ${data.count}`);
      
      // Hide the indicator
      setShowIndicator(false);
    } catch (error) {
      console.error('Error marking swipe indicator as shown:', error);
    }
  };
  
  return {
    showIndicator,
    markIndicatorShown,
  };
};

export default useSwipeIndicator;