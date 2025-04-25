import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Animated, SafeAreaView, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import GradientBackground from '@/components/GradientBackground';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeGradient } from '@/hooks/useSwipeGradient';

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
  // Get time from custom hook
  const { formattedTime, formattedDate } = useTimeClock();
  
  // Swipe gradient hook
  const {
    gradient,
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ThemedView style={styles.container}>
        <GestureDetector gesture={gesture}>
          <View style={styles.gestureContainer}>
            <View ref={viewToCaptureRef} style={styles.captureContainer} collapsable={false}>
              {/* Status Bar */}
              <StatusBarInfo />

              {/* Gradient Background */}
              <Animated.View style={[styles.gradientContainer, { opacity: opacityAnim }]}>
                <GradientBackground colors={gradient || blueGradient} />
              </Animated.View>

              {/* Time and Date */}
              <ClockDisplay time={formattedTime} date={formattedDate} />

              {/* Action Buttons */}
              <ActionButtons
                onExport={captureAndShareScreenshot}
                onSettings={modalHandlers.openEditModal}
              />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
    width: '100%', 
    height: '100%',
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
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});