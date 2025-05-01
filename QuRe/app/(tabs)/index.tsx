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

// Import QR code context
import { useQRCode } from '@/context/QRCodeContext';

// Import premium context and services
import { usePremium } from '@/context/PremiumContext';
import UserPreferencesService from '@/services/UserPreferences';

// Import modular components
import StatusBarInfo from '@/components/home/StatusBarInfo';
import ClockDisplay from '@/components/home/ClockDisplay';
import ActionButtons from '@/components/home/ActionButtons';
import QRCodeSection from '@/components/home/QRCodeSection';
import ModalGroup from '@/components/home/ModalGroup';

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
    previousGradient,
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

  // Get QR code state from context
  const { 
    qrCodes, 
    activeQRCodeId, 
    setActiveQRCode, 
    getQRCodeValue,
    addQRCode,
    updateQRCode,
    canAddQRCode,
    canRemoveBranding,
  } = useQRCode();
  
  // Get premium status from premium context
  const { 
    isPremium, 
    shouldShowOffer,
    checkPremiumStatus,
    trackOfferRejection 
  } = usePremium();
  
  // Get custom user QR code and QRe app QR code
  const customQRCode = activeQRCodeId ? qrCodes[activeQRCodeId] : null;
  const qureQRCode = qrCodes['qure-app'];
  
  // Track app session count
  const [appOpenCount, setAppOpenCount] = useState(0);

  // Modal state management hook
  const [modalStates, modalHandlers] = useModalState({
    onSaveQR: async ({ value, styleOptions }) => {
      try {
        if (customQRCode) {
          // Update existing QR code with new value
          const updatedQRCode = {
            ...customQRCode,
            styleOptions: styleOptions || customQRCode.styleOptions
          };
          
          // Update data based on type
          if (customQRCode.type === 'link') {
            updatedQRCode.data = { url: value };
          } else if (customQRCode.type === 'text') {
            updatedQRCode.data = { content: value };
          }
          // Handle other types as needed
          
          await updateQRCode(updatedQRCode);
        } else {
          // Check if user can add QR codes (respects premium status)
          if (!canAddQRCode()) {
            // This will show premium modal if appropriate
            modalHandlers.openPremiumModal();
            return;
          }
          
          // Create new QR code (default to link type)
          const newQRCode = await addQRCode('link', { url: value }, 'My QR Code', styleOptions);
          await setActiveQRCode(newQRCode.id);
        }
      } catch (error) {
        console.error('Failed to save QR code:', error);
        
        // If this error is due to premium limitations, show upgrade modal
        if (error instanceof Error) {
          if (error.message.includes('Premium required')) {
            modalHandlers.openPremiumModal();
          }
        }
      }
    },
    onUpgradePremium: async () => {
      // After successful purchase, verify premium status
      const success = await checkPremiumStatus();
      
      // Update UI if needed - this is handled by the premium context
      if (success) {
        // You could trigger some UI updates here if needed
        console.log('Premium upgrade successful!');
      }
    }
  });

  // Check app open count on mount for session-based offers
  useEffect(() => {
    const getAppOpenCount = async () => {
      const count = await UserPreferencesService.getAppOpenCount();
      setAppOpenCount(count);
      
      // Show premium offer after several sessions if not premium
      if (!isPremium && count >= 3 && shouldShowOffer('session')) {
        setTimeout(() => {
          modalHandlers.openPremiumModal();
        }, 2000); // Show after a short delay to ensure app is loaded
      }
    };
    
    getAppOpenCount();
  }, [isPremium]);

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
    if (!isPremium) {
      modalHandlers.closeEditModal();
      modalHandlers.openPremiumModal();
    }
  };

  // Handle QR code taps
  const handleCustomQRPress = () => {
    modalHandlers.openCreateQRModal();
  };

  const handleQureQRPress = () => {
    if (!isPremium) {
      modalHandlers.openPremiumModal();
    }
  };

  // Get customQRData value
  const customQRData = customQRCode ? getQRCodeValue(customQRCode.id) : '';
  const qureQRData = qureQRCode ? getQRCodeValue(qureQRCode.id) : '';
  
  // Current gradient key for display
  const currentGradientKey = gradientKeys[gradientIndex];
  
  // Determine premium trigger type for the modal
  const getPremiumTrigger = (): 'qr-add' | 'branding-removal' | 'session' | 'generation' => {
    // Default to session if we can't determine
    let trigger: 'qr-add' | 'branding-removal' | 'session' | 'generation' = 'session';
    
    // Count user QR codes
    const userQRCount = Object.values(qrCodes).filter(qr => qr.id !== 'qure-app').length;
    
    // If user already has the max free QR codes, it's likely a QR add trigger
    if (userQRCount >= 1) {
      trigger = 'qr-add';
    }
    
    // If it's a new user (first few sessions), use session trigger
    if (appOpenCount <= 3) {
      trigger = 'session';
    }
    
    return trigger;
  };

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
                  <GradientBackground colors={previousGradient || ['#0056D6', '#0A84FF']} />
                </View>
                
                {/* Current Gradient (animated opacity) */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
                  <GradientBackground colors={gradient || ['#0056D6', '#0A84FF']} />
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

                {/* QR Codes - Using isPremium from context */}
                <QRCodeSection
                  customQRData={customQRData}
                  qureQRData={qureQRData}
                  customQRStyleOptions={customQRCode?.styleOptions}
                  onCustomQRPress={handleCustomQRPress}
                  onQureQRPress={handleQureQRPress}
                  isPremiumUser={isPremium} // Use the actual premium status
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
          onCloseCreateQRModal={() => {
            // If we're closing the modal after viewing, track this for premium offers
            if (shouldShowOffer('generation')) {
              setTimeout(() => {
                modalHandlers.openPremiumModal();
              }, 500);
            }
            modalHandlers.closeCreateQRModal();
          }}
          onSaveCreateQRModal={(value, styleOptions) => {
            modalHandlers.handleSaveQR({ value, styleOptions });
          }}
          customQRData={customQRData}
          customQRStyleOptions={customQRCode?.styleOptions}
          
          // Premium Upgrade Modal props
          isPremiumModalVisible={modalStates.isPremiumModalVisible}
          onClosePremiumModal={() => {
            // Track rejection for dynamic pricing
            trackOfferRejection();
            modalHandlers.closePremiumModal();
          }}
          onUpgradePremium={modalHandlers.handleUpgradePremium}
          premiumTrigger={getPremiumTrigger()}
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