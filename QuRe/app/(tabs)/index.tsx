import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Animated, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import GradientBackground from '@/components/GradientBackground';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeGradient } from '@/hooks/useSwipeGradient';
import SwipeIndicator from '@/components/SwipeIndicator';
import useSwipeIndicator from '@/hooks/useSwipeIndicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useTimeClock from '@/hooks/useTimeClock';
import useScreenshot from '@/hooks/useScreenshot';
import useModalState from '@/hooks/useModalState';

import { useQRCode } from '@/context/QRCodeContext';
import { usePremium } from '@/context/PremiumContext';
import UserPreferencesService from '@/services/UserPreferences';

import StatusBarInfo from '@/components/home/StatusBarInfo';
import ClockDisplay from '@/components/home/ClockDisplay';
import ActionButtons from '@/components/home/ActionButtons';
import QRCodeSection from '@/components/home/QRCodeSection';
import ModalGroup from '@/components/home/ModalGroup';
import { QRType } from '@/context/QRCodeTypes';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  const { formattedTime, formattedDate } = useTimeClock();
  
  const { showIndicator, markIndicatorShown } = useSwipeIndicator(true, 5);
  
  const {
    gradient,
    previousGradient,
    gradientIndex,
    opacityAnim,
    gesture,
    gradientKeys,
    setGradientIndex,
  } = useSwipeGradient();

  const viewToCaptureRef = useRef(null);
  
  const { isTakingScreenshot, captureAndShareScreenshot } = useScreenshot({
    viewRef: viewToCaptureRef
  });

  const { 
    qrCodes, 
    activeQRCodeId, 
    setActiveQRCode, 
    getQRCodeValue,
    addQRCode,
    updateQRCode,
    deleteQRCode,
    canAddQRCode,
    canRemoveBranding,
  } = useQRCode();
  
  const { 
    isPremium, 
    shouldShowOffer,
    checkPremiumStatus,
    trackOfferRejection 
  } = usePremium();
  
  const customQRCode = activeQRCodeId ? qrCodes[activeQRCodeId] : null;
  const qureQRCode = qrCodes['qure-app'];
  
  const [appOpenCount, setAppOpenCount] = useState(0);

  const [modalStates, modalHandlers] = useModalState({
    onSaveQR: async ({ type, value, label, styleOptions }) => {
      try {
        if (customQRCode) {
          // Update existing QR code with new data
          const updatedQRCode = {
            ...customQRCode,
            label: label || customQRCode.label,
            styleOptions: styleOptions || customQRCode.styleOptions,
            updatedAt: new Date().toISOString() // Update timestamp for sorting
          };
          
          // Update data based on type
          if (updatedQRCode.type === 'link') {
            updatedQRCode.data = { url: value };
          } else if (updatedQRCode.type === 'text') {
            updatedQRCode.data = { content: value };
          } else if (updatedQRCode.type === 'email') {
            // Parse email data from mailto URL
            const emailMatch = value.match(/mailto:([^?]+)(?:\?(?:subject=([^&]*))?(?:&body=([^&]*))?)?$/);
            if (emailMatch) {
              updatedQRCode.data = {
                email: emailMatch[1] || '',
                subject: emailMatch[2] ? decodeURIComponent(emailMatch[2]) : '',
                body: emailMatch[3] ? decodeURIComponent(emailMatch[3]) : ''
              };
            }
          }
          // Add handling for other QR code types as needed
          
          await updateQRCode(updatedQRCode);
        } else {
          // Check if user can add QR codes (respects premium status)
          if (!canAddQRCode()) {
            modalHandlers.openPremiumModal();
            return;
          }
          
          // Remove the placeholder QR code if it exists and this is the first real QR code
          if (Object.keys(qrCodes).includes('user-default')) {
            await deleteQRCode('user-default');
          }
          
          // Create new QR code with proper data based on type
          let data = {};
          if (type === 'link') {
            data = { url: value };
          } else if (type === 'text') {
            data = { content: value };
          } else if (type === 'email') {
            // Parse email data - simplified for example
            data = { email: value.replace('mailto:', '') };
          }
          // Add handling for other QR code types as needed
          
          const newQRCode = await addQRCode(
            type, 
            data, 
            label || `${type.charAt(0).toUpperCase() + type.slice(1)} QR Code`, 
            styleOptions
          );
          await setActiveQRCode(newQRCode.id);
        }
      } catch (error) {
        console.error('Failed to save QR code:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('Premium required')) {
            modalHandlers.openPremiumModal();
          }
        }
      }
    },
    onUpgradePremium: async () => {
      const success = await checkPremiumStatus();
      
      if (success) {
        console.log('Premium upgrade successful!');
      }
    }
  });

  useEffect(() => {
    const getAppOpenCount = async () => {
      const count = await UserPreferencesService.getAppOpenCount();
      setAppOpenCount(count);
      
      if (!isPremium && count >= 3 && shouldShowOffer('session')) {
        setTimeout(() => {
          modalHandlers.openPremiumModal();
        }, 2000);
      }
    };
    
    getAppOpenCount();
  }, [isPremium]);

  useEffect(() => {
    setGradientIndex(0);
  }, []);
  
  useEffect(() => {
    if (showIndicator) {
      const timer = setTimeout(() => {
        markIndicatorShown();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [showIndicator, markIndicatorShown]);

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

  const handleCustomQRPress = () => {
    modalHandlers.openCreateQRModal();
  };

  const handleQureQRPress = () => {
    if (!isPremium) {
      modalHandlers.openPremiumModal();
    }
  };

  const customQRData = customQRCode ? getQRCodeValue(customQRCode.id) : '';
  const qureQRData = qureQRCode ? getQRCodeValue(qureQRCode.id) : '';
  
  const currentGradientKey = gradientKeys[gradientIndex];
  
  const getPremiumTrigger = (): 'qr-add' | 'branding-removal' | 'session' | 'generation' => {
    let trigger: 'qr-add' | 'branding-removal' | 'session' | 'generation' = 'session';
    
    const userQRCount = Object.values(qrCodes).filter(qr => 
      qr.id !== 'qure-app' && qr.id !== 'user-default'
    ).length;
    
    if (userQRCount >= 1) {
      trigger = 'qr-add';
    }
    
    if (appOpenCount <= 3) {
      trigger = 'session';
    }
    
    return trigger;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <ThemedView style={styles.container}>
        <GestureDetector gesture={gesture}>
          <View style={styles.gestureContainer}>
            <View ref={viewToCaptureRef} style={styles.captureContainer} collapsable={false}>
              <View style={styles.gradientContainer}>
                <View style={StyleSheet.absoluteFill}>
                  <GradientBackground colors={previousGradient || ['#0056D6', '#0A84FF']} />
                </View>
                
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
                  <GradientBackground colors={gradient || ['#0056D6', '#0A84FF']} />
                </Animated.View>
              </View>

              <View style={[
                styles.contentContainer,
                { 
                  paddingTop: insets.top,  
                  paddingBottom: insets.bottom
                }
              ]}>
                <StatusBarInfo />

                <ClockDisplay time={formattedTime} date={formattedDate} />

                <ActionButtons
                  onExport={captureAndShareScreenshot}
                  onSettings={modalHandlers.openEditModal}
                />

                {showIndicator && <SwipeIndicator autoHideDuration={6000} />}

                <QRCodeSection
                  customQRData={customQRData}
                  qureQRData={qureQRData}
                  customQRStyleOptions={customQRCode?.styleOptions}
                  onCustomQRPress={handleCustomQRPress}
                  onQureQRPress={handleQureQRPress}
                  isPremiumUser={isPremium}
                />
              </View>
            </View>
          </View>
        </GestureDetector>
        
        <ModalGroup
          isEditModalVisible={modalStates.isEditModalVisible}
          onCloseEditModal={modalHandlers.closeEditModal}
          onGradientSelect={(gradientKey) => {
            const index = gradientKeys.findIndex(key => key === gradientKey);
            if (index !== -1) setGradientIndex(index);
          }}
          onEditCustomQR={handleEditCustomQR}
          onManageQureQR={handleManageQureQR}
          currentGradientKey={currentGradientKey}
          
          isCreateQRModalVisible={modalStates.isCreateQRModalVisible}
          onCloseCreateQRModal={() => {
            if (shouldShowOffer('generation')) {
              setTimeout(() => {
                modalHandlers.openPremiumModal();
              }, 500);
            }
            modalHandlers.closeCreateQRModal();
          }}
          onSaveCreateQRModal={(value, label, type, styleOptions) => {
            modalHandlers.handleSaveQR({ 
              value, 
              label, 
              type: type as QRType, 
              styleOptions 
            });
          }}
          customQRData={customQRData}
          customQRStyleOptions={customQRCode?.styleOptions}
          
          isPremiumModalVisible={modalStates.isPremiumModalVisible}
          onClosePremiumModal={() => {
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
    backgroundColor: 'black',
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