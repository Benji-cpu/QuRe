import { useState } from 'react';
import { Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

interface UseScreenshotProps {
  viewRef: React.RefObject<any>;
}

interface UseScreenshotReturn {
  isTakingScreenshot: boolean;
  captureAndShareScreenshot: () => Promise<void>;
}

export const useScreenshot = ({ viewRef }: UseScreenshotProps): UseScreenshotReturn => {
  const [isTakingScreenshot, setIsTakingScreenshot] = useState<boolean>(false);

  const captureAndShareScreenshot = async (): Promise<void> => {
    if (!viewRef.current) {
      console.error('View reference is not available');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTakingScreenshot(true);

    try {
      // Small delay to ensure UI updates before capture
      await new Promise(resolve => setTimeout(resolve, 100));

      const uri = await captureRef(viewRef.current, {
        format: 'png',
        quality: 0.9,
      });
      
      console.log('Screenshot captured:', uri);
      
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing not available", "Sharing functionality is not available on this device.");
        return;
      }
      
      await Sharing.shareAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Could not take or share screenshot!", error);
      Alert.alert("Error", "Could not export wallpaper.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  return {
    isTakingScreenshot,
    captureAndShareScreenshot,
  };
};

export default useScreenshot;