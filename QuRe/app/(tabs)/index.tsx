import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Animated, StatusBar, Alert, TouchableOpacity, Text } from 'react-native';
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
import { createQRCodeItem } from '@/context/QRCodeUtils';

// --- Constants for QR Code IDs ---
const PRIMARY_QR_ID = 'user-custom-primary'; 
const SECONDARY_QR_ID = 'user-custom-secondary';
const DEFAULT_PLACEHOLDER_ID = 'user-default'; // ID for the initial placeholder
const DEFAULT_BRANDED_ID = 'qure-app';

// Define ModalStates and ModalHandlers types (adjust if useModalState is imported)
interface ModalStates {
  isEditModalVisible: boolean;
  isCreateQRModalVisible: boolean;
  isPremiumModalVisible: boolean;
  editingQRCode: QRCodeItem | null; // Keep track of the item being edited
  editingSlot: 'primary' | 'secondary' | null; // NEW: Track which slot is being edited
}

interface ModalHandlers {
  openEditModal: () => void;
  closeEditModal: () => void;
  openCreateQRModal: (slot: 'primary' | 'secondary', qrCodeToEdit?: QRCodeItem) => void;
  closeCreateQRModal: () => void;
  openPremiumModal: () => void;
  closePremiumModal: () => void;
  handleSaveQR: (params: SaveQRParams) => Promise<void>;
  handleResetToCreate: () => void;
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
    getQRCodeValue,
    addQRCode,
    updateQRCode,
    deleteQRCode,
    canAddQRCode,
    canRemoveBranding,
    isLoading: qrLoading, 
    error: qrError 
  } = useQRCode();
  
  const { 
    isPremium, 
    shouldShowOffer,
    checkPremiumStatus,
    trackOfferRejection,
    // --- Testing --- 
    forceUpgrade,
    forceDowngrade,
  } = usePremium();
  
  // --- Get specific QR Code items based on defined IDs ---
  const primaryQRCodeItem = qrCodes[PRIMARY_QR_ID] || qrCodes[DEFAULT_PLACEHOLDER_ID] || null;
  const secondaryQRCodeItem = qrCodes[SECONDARY_QR_ID] || null;
  const defaultBrandedQRCodeItem = qrCodes[DEFAULT_BRANDED_ID] || null;
  
  const [appOpenCount, setAppOpenCount] = useState(0);

  // --- Inline useModalState implementation --- 
  const [modalStates, setModalStates] = useState<ModalStates>({
    isEditModalVisible: false,
    isCreateQRModalVisible: false,
    isPremiumModalVisible: false,
    editingQRCode: null, 
    editingSlot: null, // Initialize editingSlot
  });

  const modalHandlers: ModalHandlers = {
    openEditModal: () => setModalStates(prev => ({ ...prev, isEditModalVisible: true })),
    closeEditModal: () => setModalStates(prev => ({ ...prev, isEditModalVisible: false })),
    openCreateQRModal: (slot: 'primary' | 'secondary', qrCodeToEdit?: QRCodeItem) => {
      console.log(`[ModalHandler] Opening CreateQRModal for slot: ${slot}. Editing:`, qrCodeToEdit ? qrCodeToEdit.id : 'None');
      setModalStates(prev => ({ 
        ...prev, 
        isCreateQRModalVisible: true, 
        editingQRCode: qrCodeToEdit || null,
        editingSlot: slot, // Set the slot being edited
      }));
    },
    closeCreateQRModal: () => {
       console.log("[ModalHandler] Closing CreateQRModal.");
       setModalStates(prev => ({ 
        ...prev, 
        isCreateQRModalVisible: false, 
        editingQRCode: null,
        editingSlot: null, // Reset editingSlot
      }));
    },
    openPremiumModal: () => setModalStates(prev => ({ ...prev, isPremiumModalVisible: true })),
    closePremiumModal: () => setModalStates(prev => ({ ...prev, isPremiumModalVisible: false })),
    handleSaveQR: useCallback(async ({ type, value, label, styleOptions }: SaveQRParams) => {
      const currentEditingSlot = modalStates.editingSlot;
      const qrToEdit = modalStates.editingQRCode;
      console.log(`[handleSaveQR] Initiated for slot: ${currentEditingSlot}. Mode: ${qrToEdit ? 'UPDATE' : 'ADD'}`);
      
      if (!currentEditingSlot) {
        console.error('[handleSaveQR] Error: No editing slot specified.');
        Alert.alert("Error", "Could not determine which QR code slot to save.");
        return;
      }

      const targetId = currentEditingSlot === 'primary' ? PRIMARY_QR_ID : SECONDARY_QR_ID;
      
      try {
        const parsedData = parseQRCodeValue(type, value);

        if (qrToEdit && qrToEdit.id === targetId) {
          // --- Updating Existing QR Code --- 
          console.log(`[handleSaveQR] Updating ${currentEditingSlot} QR ID: ${targetId}`);
          const updatedQRCode: QRCodeItem = {
            ...qrToEdit,
            type: type,      
            data: parsedData,      
            label: label || qrToEdit.label, 
            styleOptions: styleOptions || qrToEdit.styleOptions,
            updatedAt: new Date().toISOString()
          };
          await updateQRCode(updatedQRCode);
        } else {
          // --- Creating/Overwriting QR Code for the Slot --- 
          console.log(`[handleSaveQR] Creating/Overwriting QR for ${currentEditingSlot} slot (Target ID: ${targetId})`);
          
          // Delete placeholder if adding primary for the first time
          if (currentEditingSlot === 'primary' && qrCodes[DEFAULT_PLACEHOLDER_ID]) {
             console.log(`[handleSaveQR] Deleting placeholder QR: ${DEFAULT_PLACEHOLDER_ID}`);
             try { await deleteQRCode(DEFAULT_PLACEHOLDER_ID); } catch (delError) { console.error("[handleSaveQR] Error deleting placeholder:", delError); }
          }

          // Use updateQRCode for both creating (if ID is new) and overwriting
          const finalLabel = label || `${type.charAt(0).toUpperCase() + type.slice(1)} QR Code`;
          // Create the data structure, but let updateQRCode handle insertion/update
          const qrCodeDataForSlot: QRCodeItem = createQRCodeItem(type, parsedData, finalLabel, styleOptions);
          qrCodeDataForSlot.id = targetId; // ** Ensure it has the target ID **
          
          console.log(`[handleSaveQR] Calling updateQRCode with target ID: ${qrCodeDataForSlot.id}`);
          await updateQRCode(qrCodeDataForSlot); 
        }
        
        modalHandlers.closeCreateQRModal(); 
      } catch (error) {
        console.error(`[handleSaveQR] Error saving to slot ${currentEditingSlot}:`, error);
        Alert.alert("Error", "Failed to save QR code. Please try again.");
      }
    }, [modalStates.editingSlot, modalStates.editingQRCode, qrCodes, addQRCode, updateQRCode, deleteQRCode]),
    
    handleUpgradePremium: useCallback(async () => {
      console.log(`[handleUpgradePremium] Initiated.`);
      try {
          const success = await checkPremiumStatus();      
          if (success) {
            console.log('[handleUpgradePremium] Premium verified successfully!');
            modalHandlers.closePremiumModal();
          } else {
            console.log('[handleUpgradePremium] Premium verification failed.');
            Alert.alert("Upgrade Failed", "Failed to verify premium status. Please try again later.");
          }
      } catch (error) {
          console.error("[handleUpgradePremium] Error:", error);
          Alert.alert("Error", "An error occurred while checking premium status.");
      }
    }, [checkPremiumStatus]),
    handleResetToCreate: () => {
      console.log("[ModalHandler] Resetting to create mode.");
      setModalStates(prev => ({ ...prev, editingQRCode: null }));
    },
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

  // Renamed: Press handler for the FIRST slot
  const handlePrimaryPress = () => {
    console.log('[HomeScreen] handlePrimaryPress called.');
    const primaryQR = qrCodes[PRIMARY_QR_ID];
    modalHandlers.openCreateQRModal('primary', primaryQR); // Open modal for primary slot
  };

  // Renamed: Press handler for the SECOND slot
  const handleSecondaryPress = () => {
    console.log('[HomeScreen] handleSecondaryPress called.'); 
    if (!isPremium) {
      console.log('[HomeScreen] Not premium, opening premium modal.'); 
      modalHandlers.openPremiumModal();
    } else {
      // If premium, open create/edit modal for the secondary slot
      const secondaryQR = qrCodes[SECONDARY_QR_ID];
      console.log('[HomeScreen] Premium user, opening create/edit modal for secondary slot. Existing data:', secondaryQR);
      modalHandlers.openCreateQRModal('secondary', secondaryQR); 
    }
  };

  // Get specific QR code values
  const primaryQRValue = primaryQRCodeItem ? getQRCodeValue(primaryQRCodeItem.id) : '';
  const secondaryQRValue = secondaryQRCodeItem ? getQRCodeValue(secondaryQRCodeItem.id) : '';
  const defaultBrandedQRValue = defaultBrandedQRCodeItem ? getQRCodeValue(defaultBrandedQRCodeItem.id) : '';
  
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

  // Update initialModalValue logic based on editingSlot
  const initialModalValue = useMemo(() => {
    const slot = modalStates.editingSlot;
    const itemToEdit = modalStates.editingQRCode; // This should match the item for the slot
    console.log(`[Memo] Recalculating initialModalValue for slot: ${slot}. Editing QR:`, itemToEdit?.id);
    
    if (slot && itemToEdit && itemToEdit.id !== DEFAULT_PLACEHOLDER_ID) {
       // Ensure the item being edited actually belongs to the slot we think we're editing
       const expectedId = slot === 'primary' ? PRIMARY_QR_ID : SECONDARY_QR_ID;
       if (itemToEdit.id === expectedId) {
         return {
           type: itemToEdit.type,
           value: getQRCodeValue(itemToEdit.id),
           label: itemToEdit.label,
           styleOptions: itemToEdit.styleOptions
         };
       } else {
          console.warn(`[Memo] Mismatch between editingSlot (${slot}) and editingQRCode ID (${itemToEdit.id}). Resetting.`);
          return undefined; // Mismatch, treat as create mode
       }
    } else {
      return undefined; // Create mode
    }
  }, [modalStates.editingSlot, modalStates.editingQRCode, getQRCodeValue]); 

  // --- Define styles that depend on dynamic values (like insets) inside the component --- 
  const dynamicStyles = StyleSheet.create({
    testButtonContainer: {
      position: 'absolute',
      bottom: insets.bottom + 10, // Use insets here
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      backgroundColor: 'rgba(0,0,0,0.1)',
      zIndex: 100,
    },
  });

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
                {/* Wrap elements to be hidden and apply conditional style */}
                <View style={[isTakingScreenshot && styles.hiddenElement]}>
                  <StatusBarInfo />
                </View>

                <View style={[isTakingScreenshot && styles.hiddenElement]}>
                  <ClockDisplay time={formattedTime} date={formattedDate} />
                </View>

                <View style={[isTakingScreenshot && styles.hiddenElement]}>
                  <ActionButtons
                    onExport={captureAndShareScreenshot} // This triggers isTakingScreenshot
                    onSettings={modalHandlers.openEditModal}
                  />
                </View>

                {showIndicator && (
                  <View style={[isTakingScreenshot && styles.hiddenElement]}>
                    <SwipeIndicator autoHideDuration={6000} />
                  </View>
                )}

                <QRCodeSection
                  primaryQRCodeItem={primaryQRCodeItem}
                  secondaryQRCodeItem={secondaryQRCodeItem}
                  defaultBrandedQRCodeItem={defaultBrandedQRCodeItem}
                  primaryQRValue={primaryQRValue}
                  secondaryQRValue={secondaryQRValue}
                  defaultBrandedQRValue={defaultBrandedQRValue}
                  onPrimaryPress={handlePrimaryPress}
                  onSecondaryPress={handleSecondaryPress}
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
          onResetToCreate={modalHandlers.handleResetToCreate}
        />

        {/* --- Premium Testing Buttons --- */}
        <View style={dynamicStyles.testButtonContainer}>
          <TouchableOpacity onPress={forceUpgrade} style={[styles.testButton, styles.upgradeButton]}>
            <Text style={styles.testButtonText}>Test Upgrade</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={forceDowngrade} style={[styles.testButton, styles.downgradeButton]}>
            <Text style={styles.testButtonText}>Test Downgrade</Text>
          </TouchableOpacity>
          <Text style={styles.testStatusText}>Premium: {isPremium ? 'YES' : 'NO'}</Text>
        </View>
        {/* --- End Premium Testing Buttons --- */}
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
  // --- Test Button Styles (static parts) --- 
  testButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  upgradeButton: {
    backgroundColor: '#10b981', // Green
  },
  downgradeButton: {
    backgroundColor: '#ef4444', // Red
  },
  testButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  testStatusText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 10,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  // --- End Test Button Styles (static parts) --- 
  
  // Style to hide elements without affecting layout
  hiddenElement: {
    opacity: 0,
  },
});