import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INDICATOR_SHOWN_KEY = 'swipe_indicator_shown';

interface UseSwipeIndicatorReturn {
  showIndicator: boolean;
  markIndicatorShown: () => Promise<void>;
}

export const useSwipeIndicator = (
  alwaysShowOnFirstLoad: boolean = false,
  maxShownCount: number = 3
): UseSwipeIndicatorReturn => {
  const [showIndicator, setShowIndicator] = useState<boolean>(false);
  
  useEffect(() => {
    const checkIfShouldShow = async () => {
      try {
        // Get the stored indicator data
        const indicatorData = await AsyncStorage.getItem(INDICATOR_SHOWN_KEY);
        let data = { count: 0, lastShown: 0 };
        
        if (indicatorData) {
          data = JSON.parse(indicatorData);
        }
        
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const showAgain = alwaysShowOnFirstLoad 
          || data.count < maxShownCount
          || (now - data.lastShown) > oneDayMs * 3; // Show again after 3 days
        
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