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

import StatusBarInfo from '@/components/home/StatusBarInfo';
import ClockDisplay from '@/components/home/ClockDisplay';
import ActionButtons from '@/components/home/ActionButtons';
import QRCodeSection from '@/components/home/QRCodeSection';
import ModalGroup from '@/components/home/ModalGroup';

const blueGradient = ['#0056D6', '#0A84FF'];

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

  // QR state - UPDATED VALUES HERE
  const [customQRData, setCustomQRData] = useState<string>('https://qr.io/');
  const [qureQRData] = useState<string>('https://qr.io/');
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [customQRStyleOptions, setCustomQRStyleOptions] = useState<any>(null);

  const [modalStates, modalHandlers] = useModalState({
    onSaveQR: (newValue: string, styleOptions?: any) => {
      setCustomQRData(newValue);
      if (styleOptions) {
        setCustomQRStyleOptions(styleOptions);
      }
    },
    onUpgradePremium: () => setIsPremiumUser(true)
  });

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
    if (!isPremiumUser) {
      modalHandlers.closeEditModal();
      modalHandlers.openPremiumModal();
    }
  };

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
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <ThemedView style={styles.container}>
        <GestureDetector gesture={gesture}>
          <View style={styles.gestureContainer}>
            <View ref={viewToCaptureRef} style={styles.captureContainer} collapsable={false}>
              <View style={styles.gradientContainer}>
                <View style={StyleSheet.absoluteFill}>
                  <GradientBackground colors={previousGradient || blueGradient} />
                </View>
                
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
                  <GradientBackground colors={gradient || blueGradient} />
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
                  customQRStyleOptions={customQRStyleOptions}
                  onCustomQRPress={handleCustomQRPress}
                  onQureQRPress={handleQureQRPress}
                  isPremiumUser={isPremiumUser}
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
          onCloseCreateQRModal={modalHandlers.closeCreateQRModal}
          onSaveCreateQRModal={(value, styleOptions) => {
            modalHandlers.handleSaveQR(value, styleOptions);
          }}
          customQRData={customQRData}
          customQRStyleOptions={customQRStyleOptions}
          
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