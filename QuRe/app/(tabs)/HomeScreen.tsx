import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import GradientBackground from '@/components/GradientBackground';
import { GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useSwipeGradient } from '@/hooks/useSwipeGradient';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import EditModal from '@/components/EditModal';
import CreateQRModal from '@/components/CreateQRModal';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing'; // Uncomment import

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const {
    gradient,
    gradientIndex,
    opacityAnim,
    gesture,
    gradientKeys,
    setGradientIndex,
  } = useSwipeGradient();

  // State for QR Codes and User Status
  const [customQRData, setCustomQRData] = useState<string>('Your Custom Link');
  const [qureQRData, setQureQRData] = useState<string>('https://qure.app/download');
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState<boolean>(false);

  // Modal Visibility State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateQRModalVisible, setIsCreateQRModalVisible] = useState(false);
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);

  const iconColor = useThemeColor({}, 'icon');

  const viewToCaptureRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // --- Modal Handlers ---
  const handleOpenEditModal = () => setIsEditModalVisible(true);
  const handleCloseEditModal = () => setIsEditModalVisible(false);

  const handleOpenCreateQRModal = () => setIsCreateQRModalVisible(true);
  const handleCloseCreateQRModal = () => setIsCreateQRModalVisible(false);
  const handleSaveCreateQRModal = (newValue: string) => {
    setCustomQRData(newValue);
    setIsCreateQRModalVisible(false); // Close on save
  };

  const handleOpenPremiumModal = () => setIsPremiumModalVisible(true);
  const handleClosePremiumModal = () => setIsPremiumModalVisible(false);
  const handleUpgradePremium = () => {
    console.log('Attempting premium upgrade...');
    // TODO: Implement actual upgrade logic
    setIsPremiumUser(true); // Simulate successful upgrade for now
    setIsPremiumModalVisible(false);
  };

  // --- Prop Handlers for EditModal ---
  const handleGradientSelect = (gradientKey: string) => {
    const index = gradientKeys.findIndex(key => key === gradientKey);
    if (index !== -1) {
      setGradientIndex(index);
    }
    // Maybe close modal or keep open?
  };

  const handleEditCustomQR = () => {
    handleCloseEditModal(); // Close Edit modal first
    handleOpenCreateQRModal(); // Then open Create QR modal
  };

  const handleManageQureQR = () => {
    // Logic for premium users to hide/show QuRe QR might go here or in premium flow
    console.log('Manage QuRe QR tapped - logic TBD');
    if (!isPremiumUser) {
      handleCloseEditModal();
      handleOpenPremiumModal();
    }
  };

  // --- Tap Handlers for QR Codes (Updated) ---
  const handleCustomQRPress = () => {
    handleOpenCreateQRModal(); // Open create/edit modal directly
  };

  const handleQureQRPress = () => {
    if (!isPremiumUser) {
      handleOpenPremiumModal(); // Open premium prompt for free users
    }
    // Premium users might do nothing or have a different action later
  };

  const currentGradientKey = gradientKeys[gradientIndex]; // Get current key for EditModal

  // --- Screenshot Logic ---
  const handleTakeScreenshot = async () => {
    setIsTakingScreenshot(true);
    try {
      // Wait a moment for UI to update (elements to hide)
      await new Promise(resolve => setTimeout(resolve, 100)); 

      const uri = await captureRef(viewToCaptureRef, {
        format: 'png', // Or 'jpg'
        quality: 0.9, // 0.0 - 1.0
        // result: 'base64', // If you need base64 data
      });
      console.log('Screenshot captured:', uri);
      
      // Check if sharing is available before attempting
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing not available", "Sharing functionality is not available on this device.");
        return; // Exit early
      }
      
      await Sharing.shareAsync(uri); // Uncomment and use share function
      // Alert.alert("Screenshot Saved (temp)", `URI: ${uri}`); // Remove temp alert
    } catch (error) {
      console.error("Oops, screenshot failed or sharing failed!", error);
      Alert.alert("Error", "Could not take or share screenshot.");
    } finally {
      setIsTakingScreenshot(false); // Ensure UI reappears
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <ThemedView style={styles.container}>
        <View ref={viewToCaptureRef} style={styles.captureContainer} collapsable={false}>
          <Animated.View style={[styles.gradientContainer, { opacity: opacityAnim }]}>
            <GradientBackground colors={gradient} />
          </Animated.View>

          <View style={styles.timeDateContainer}>
            <ThemedText style={styles.timeText}>{formattedTime}</ThemedText>
            <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
          </View>

          <View style={styles.qrContainer}>
            <QRCodeDisplay
              value={customQRData}
              size={120}
              onPress={handleCustomQRPress}
              isVisible={true}
            />
            <QRCodeDisplay
              value={qureQRData}
              size={120}
              onPress={handleQureQRPress}
              isVisible={!isPremiumUser}
            />
          </View>
        </View>

        {!isTakingScreenshot && (
          <TouchableOpacity style={styles.editButton} onPress={handleOpenEditModal}>
            <Ionicons name="create-outline" size={28} color={iconColor} />
          </TouchableOpacity>
        )}

        {!isTakingScreenshot && (
          <TouchableOpacity style={styles.screenshotButton} onPress={handleTakeScreenshot}>
            <Ionicons name="camera-outline" size={28} color={iconColor} />
          </TouchableOpacity>
        )}

        {!isTakingScreenshot && (
          <View style={styles.indicatorContainer}>
            {gradientKeys.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  index === gradientIndex ? styles.indicatorDotActive : null,
                ]}
              />
            ))}
          </View>
        )}

        <EditModal
          isVisible={isEditModalVisible}
          onClose={handleCloseEditModal}
          onGradientSelect={handleGradientSelect}
          onEditCustomQR={handleEditCustomQR}
          onManageQureQR={handleManageQureQR}
          currentGradientKey={currentGradientKey}
        />
        <CreateQRModal
          isVisible={isCreateQRModalVisible}
          onClose={handleCloseCreateQRModal}
          onSave={handleSaveCreateQRModal}
          initialValue={customQRData}
        />
        <PremiumUpgradeModal
          isVisible={isPremiumModalVisible}
          onClose={handleClosePremiumModal}
          onUpgrade={handleUpgradePremium}
        />
      </ThemedView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  captureContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  editButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  screenshotButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  timeDateContainer: {
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  dateText: {
    fontSize: 18,
    backgroundColor: 'transparent',
  },
  qrContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
    minHeight: 150,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
}); 