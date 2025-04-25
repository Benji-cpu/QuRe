import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Animated, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import GradientBackground from '@/components/GradientBackground';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeGradient } from '@/hooks/useSwipeGradient';
import SwipeIndicator from '@/components/SwipeIndicator';
import useSwipeIndicator from '@/hooks/useSwipeIndicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import custom hooks
import useTimeClock from '@/hooks/useTimeClock';
import useScreenshot from '@/hooks/useScreenshot';
import useModalState from '@/hooks/useModalState';

// Import modular components
import StatusBarInfo from '@/components/home/StatusBarInfo';
import ClockDisplay from '@/components/home/ClockDisplay';
import ActionButtons from '@/components/home/ActionButtons';
import QRCodeSection from '@/components/home/QRCodeSection';
import ModalGroup from '@/components/home/ModalGroup';

// Define a blue gradient similar to the screenshot
const blueGradient = ['#0056D6', '#0A84FF'];

export default function HomeScreen() {
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // Get time from custom hook
  const { formattedTime, formattedDate } = useTimeClock();
  
  // Swipe indicator hook - force it to always show for first few loads
  const { showIndicator, markIndicatorShown } = useSwipeIndicator(true, 5);
  
  // Swipe gradient hook
  const {
    gradient,
    previousGradient,  // Added for cross-fade
    gradientIndex,
    opacityAnim,
    gesture,
    gradientKeys,
    setGradientIndex,
  } = useSwipeGradient();

  // Ref for screenshot capture
  const viewToCaptureRef = useRef(null);
  
  // Screenshot hook
  const { isTakingScreenshot, captureAndShareScreenshot } = useScreenshot({
    viewRef: viewToCaptureRef
  });

  // QR state
  const [customQRData, setCustomQRData] = useState<string>('https://yourprofile.com');
  const [qureQRData] = useState<string>('https://qure.app/download');
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  // Modal state management hook
  const [modalStates, modalHandlers] = useModalState({
    onSaveQR: setCustomQRData,
    onUpgradePremium: () => setIsPremiumUser(true)
  });

  // Set initial gradient to blue
  useEffect(() => {
    setGradientIndex(0); // Assuming index 0 will be our blue gradient
  }, []);
  
  // Effect to mark swipe indicator as shown after it displays
  useEffect(() => {
    if (showIndicator) {
      // Wait longer before hiding to ensure users see it
      const timer = setTimeout(() => {
        markIndicatorShown();
      }, 6000); // Longer duration to ensure users notice it
      
      return () => clearTimeout(timer);
    }
  }, [showIndicator, markIndicatorShown]);

  // Edit modal handlers that connect with multiple modals
  const handleEditCustomQR = () => {
    modalHandlers.closeEditModal();
    modalHandlers.openCreateQRModal();
  };

  const handleManageQureQR = () => {
    if (!isPremiumUser) {
      modalHandlers.closeEditModal();
      modalHandlers.openPremiumModal();
    }
  };

  // Handle QR code taps
  const handleCustomQRPress = () => {
    modalHandlers.openCreateQRModal();
  };

  const handleQureQRPress = () => {
    if (!isPremiumUser) {
      modalHandlers.openPremiumModal();
    }
  };

  const currentGradientKey = gradientKeys[gradientIndex];

  return (
    <View style={styles.container}>
      {/* Use StatusBar with translucent={true} to extend behind it */}
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <ThemedView style={styles.container}>
        <GestureDetector gesture={gesture}>
          <View style={styles.gestureContainer}>
            <View ref={viewToCaptureRef} style={styles.captureContainer} collapsable={false}>
              {/* Gradient Background with cross-fade transition */}
              <View style={styles.gradientContainer}>
                {/* Previous Gradient (always visible behind current) */}
                <View style={StyleSheet.absoluteFill}>
                  <GradientBackground colors={previousGradient || blueGradient} />
                </View>
                
                {/* Current Gradient (animated opacity) */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
                  <GradientBackground colors={gradient || blueGradient} />
                </Animated.View>
              </View>

              {/* Content container - Respect safe areas for interactive elements */}
              <View style={[
                styles.contentContainer,
                { 
                  paddingTop: insets.top,  
                  paddingBottom: insets.bottom
                }
              ]}>
                {/* Status Bar */}
                <StatusBarInfo />

                {/* Time and Date */}
                <ClockDisplay time={formattedTime} date={formattedDate} />

                {/* Action Buttons */}
                <ActionButtons
                  onExport={captureAndShareScreenshot}
                  onSettings={modalHandlers.openEditModal}
                />

                {/* Swipe Indicator - Moved outside GestureDetector to ensure visibility */}
                {showIndicator && <SwipeIndicator autoHideDuration={6000} />}

                {/* QR Codes */}
                <QRCodeSection
                  customQRData={customQRData}
                  qureQRData={qureQRData}
                  onCustomQRPress={handleCustomQRPress}
                  onQureQRPress={handleQureQRPress}
                  isPremiumUser={isPremiumUser}
                />
              </View>
            </View>
          </View>
        </GestureDetector>
        
        

        {/* Modals */}
        <ModalGroup
          // Edit Modal props
          isEditModalVisible={modalStates.isEditModalVisible}
          onCloseEditModal={modalHandlers.closeEditModal}
          onGradientSelect={(gradientKey) => {
            const index = gradientKeys.findIndex(key => key === gradientKey);
            if (index !== -1) setGradientIndex(index);
          }}
          onEditCustomQR={handleEditCustomQR}
          onManageQureQR={handleManageQureQR}
          currentGradientKey={currentGradientKey}
          
          // Create QR Modal props
          isCreateQRModalVisible={modalStates.isCreateQRModalVisible}
          onCloseCreateQRModal={modalHandlers.closeCreateQRModal}
          onSaveCreateQRModal={modalHandlers.handleSaveQR}
          customQRData={customQRData}
          
          // Premium Upgrade Modal props
          isPremiumModalVisible={modalStates.isPremiumModalVisible}
          onClosePremiumModal={modalHandlers.closePremiumModal}
          onUpgradePremium={modalHandlers.handleUpgradePremium}
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Fill any gaps with black
  },
  gestureContainer: {
    flex: 1, 
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  captureContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});