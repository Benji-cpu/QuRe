import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Animated, StatusBar, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import GradientBackground from '@/components/GradientBackground';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeGradient } from '@/hooks/useSwipeGradient';
import SwipeIndicator from '@/components/SwipeIndicator';
import useSwipeIndicator from '@/hooks/useSwipeIndicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useTimeClock from '@/hooks/useTimeClock';
import useScreenshot from '@/hooks/useScreenshot';

import { useQRCode } from '@/context/QRCodeContext';
import { usePremium } from '@/context/PremiumContext';
import UserPreferencesService from '@/services/UserPreferences';

import StatusBarInfo from '@/components/home/StatusBarInfo';
import ClockDisplay from '@/components/home/ClockDisplay';
import ActionButtons from '@/components/home/ActionButtons';
import QRCodeSection from '@/components/home/QRCodeSection';
import ModalGroup from '@/components/home/ModalGroup';
import { QRType, QRCodeItem } from '@/context/QRCodeTypes';

// Define ModalStates and ModalHandlers types (adjust if useModalState is imported)
interface ModalStates {
  isEditModalVisible: boolean;
  isCreateQRModalVisible: boolean;
  isPremiumModalVisible: boolean;
  editingQRCode: QRCodeItem | null; // Add state for QR being edited
}

interface ModalHandlers {
  openEditModal: () => void;
  closeEditModal: () => void;
  openCreateQRModal: (qrCode?: QRCodeItem) => void; // Allow passing QR item
  closeCreateQRModal: () => void;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
  handleSaveQR: (params: SaveQRParams) => Promise<void>;
  handleUpgradePremium: () => Promise<void>;
}

// Define the type for the data passed to onSaveQR
type SaveQRParams = { 
  type: QRType; 
  value: string; // The formatted value string from the modal
  label?: string; 
  styleOptions?: any; 
};

// Placeholder parser (needs proper implementation)
const parseQRCodeValue = (type: QRType, value: string): any => {
  console.warn("parseQRCodeValue needs proper implementation!");
  if (type === 'link') return { url: value };
  if (type === 'text') return { content: value };
  if (type === 'email') return { email: value.replace('mailto:', '').split('?')[0] };
  // Add more types
  return { url: value }; 
};

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

  // --- Inline useModalState implementation --- 
  const [modalStates, setModalStates] = useState<ModalStates>({
    isEditModalVisible: false,
    isCreateQRModalVisible: false,
    isPremiumModalVisible: false,
    editingQRCode: null, // Initialize editing state
  });

  const modalHandlers: ModalHandlers = {
    openEditModal: () => setModalStates(prev => ({ ...prev, isEditModalVisible: true })),
    closeEditModal: () => setModalStates(prev => ({ ...prev, isEditModalVisible: false })),
    openCreateQRModal: (qrCodeToEdit?: QRCodeItem) => {
      console.log("Opening CreateQRModal. Editing:", qrCodeToEdit ? qrCodeToEdit.id : 'None');
      setModalStates(prev => ({ 
        ...prev, 
        isCreateQRModalVisible: true, 
        editingQRCode: qrCodeToEdit || null // Set the QR code to edit
      }));
    },
    closeCreateQRModal: () => setModalStates(prev => ({ 
      ...prev, 
      isCreateQRModalVisible: false, 
      editingQRCode: null // Clear editing state
    })),
    openPremiumModal: () => setModalStates(prev => ({ ...prev, isPremiumModalVisible: true })),
    closePremiumModal: () => setModalStates(prev => ({ ...prev, isPremiumModalVisible: false })),
    handleSaveQR: useCallback(async ({ type, value, label, styleOptions }: SaveQRParams) => {
      try {
        const qrToEdit = modalStates.editingQRCode; // Get QR being edited from state

        if (qrToEdit) { 
          // --- Updating Existing QR Code --- 
          console.log("Attempting to UPDATE QR:", qrToEdit.id);
          const parsedData = parseQRCodeValue(type, value); 

          const updatedQRCode: QRCodeItem = {
            ...qrToEdit,
            type: type,      
            data: parsedData, // Use parsed data       
            label: label || qrToEdit.label, 
            styleOptions: styleOptions || qrToEdit.styleOptions,
            updatedAt: new Date().toISOString()
          };
          
          await updateQRCode(updatedQRCode);
          console.log("Update successful for:", updatedQRCode.id)
        } else {
          // --- Creating New QR Code --- 
          console.log("Attempting to ADD new QR");
          if (!canAddQRCode()) {
            modalHandlers.openPremiumModal();
            return;
          }
          
          // Ensure placeholder is removed if it exists
          if (qrCodes['user-default']) {
             console.log("Deleting placeholder QR: user-default");
             try {
               await deleteQRCode('user-default');
             } catch (delError) {
                console.error("Error deleting placeholder:", delError);
                // Decide if we should proceed or stop if placeholder deletion fails
             }
          }
          
          const parsedData = parseQRCodeValue(type, value);
          
          const newQRCode = await addQRCode(
            type, 
            parsedData, // Pass structured data
            label || `${type.charAt(0).toUpperCase() + type.slice(1)} QR Code`, 
            styleOptions
          );
          console.log("Add successful. New ID:", newQRCode.id);
          await setActiveQRCode(newQRCode.id);
        }
        modalHandlers.closeCreateQRModal(); // Close modal on successful save
      } catch (error) {
        console.error('Failed to save QR code:', error);
        if (error instanceof Error && error.message.includes('Premium required')) {
          modalHandlers.openPremiumModal();
        } else {
          Alert.alert("Error", "Failed to save QR code. Please try again.");
        }
      }
    }, [modalStates.editingQRCode, qrCodes, canAddQRCode, addQRCode, updateQRCode, setActiveQRCode, deleteQRCode]), // Add dependencies
    handleUpgradePremium: useCallback(async () => {
        const success = await checkPremiumStatus();      
        if (success) {
          console.log('Premium upgrade successful!');
          modalHandlers.closePremiumModal(); // Close modal on success
        } else {
          Alert.alert("Upgrade Failed", "Failed to verify premium status. Please try again later.");
        }
    }, [checkPremiumStatus]), // Add dependency
  };
  // --- End Inline useModalState --- 

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
  }, [isPremium, shouldShowOffer]); // Updated dependencies

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
    if (customQRCode && customQRCode.id !== 'user-default') {
      modalHandlers.openCreateQRModal(customQRCode); // Open with data
    } else {
      console.log("No custom QR code selected to edit.");
      Alert.alert("Edit QR Code", "No custom QR code available to edit.");
      // Optionally open in create mode: modalHandlers.openCreateQRModal();
    }
  };

  const handleManageQureQR = () => {
    if (!isPremium) {
      modalHandlers.closeEditModal();
      modalHandlers.openPremiumModal();
    } // Add premium logic later
  };

  const handleCustomQRPress = () => {
    if (customQRCode && customQRCode.id !== 'user-default') {
      // If it's a real QR code, open modal in EDIT mode
      modalHandlers.openCreateQRModal(customQRCode); 
    } else {
      // If placeholder or null, open modal in CREATE mode
      modalHandlers.openCreateQRModal(); 
    }
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

  // Prepare the initial value for the CreateQRModal based on modal state
  const initialModalValue = modalStates.editingQRCode 
    ? {
        type: modalStates.editingQRCode.type,
        value: getQRCodeValue(modalStates.editingQRCode.id), // Pass formatted string
        label: modalStates.editingQRCode.label,
        styleOptions: modalStates.editingQRCode.styleOptions
      }
    : undefined; // Undefined for create mode

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
                  customQRCode={customQRCode}
                  customQRValue={customQRData}
                  qureQRData={qureQRData}
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
          onCloseCreateQRModal={modalHandlers.closeCreateQRModal}
          onSaveCreateQRModal={(value, label, type, styleOptions) => {
            modalHandlers.handleSaveQR({ value, label, type: type as QRType, styleOptions });
          }}
          initialValue={initialModalValue}
          
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