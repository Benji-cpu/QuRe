import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Alert, Text } from 'react-native';
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
import * as Sharing from 'expo-sharing';

// Define a blue gradient similar to the screenshot
const blueGradient = ['#0056D6', '#0A84FF'];

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
  const [customQRData, setCustomQRData] = useState<string>('https://yourprofile.com');
  const [qureQRData, setQureQRData] = useState<string>('https://qure.app/download');
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState<boolean>(false);

  // Modal Visibility State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateQRModalVisible, setIsCreateQRModalVisible] = useState(false);
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);

  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const viewToCaptureRef = useRef(null);

  // Set initial gradient to blue (could also modify the Gradients object in Colors.ts)
  useEffect(() => {
    // Force the first gradient to be the blue one
    setGradientIndex(0); // Assuming index 0 will be our blue gradient
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  // --- Modal Handlers ---
  const handleOpenEditModal = () => setIsEditModalVisible(true);
  const handleCloseEditModal = () => setIsEditModalVisible(false);

  const handleOpenCreateQRModal = () => setIsCreateQRModalVisible(true);
  const handleCloseCreateQRModal = () => setIsCreateQRModalVisible(false);
  const handleSaveCreateQRModal = (newValue: string) => {
    setCustomQRData(newValue);
    setIsCreateQRModalVisible(false); 
  };

  const handleOpenPremiumModal = () => setIsPremiumModalVisible(true);
  const handleClosePremiumModal = () => setIsPremiumModalVisible(false);
  const handleUpgradePremium = () => {
    console.log('Attempting premium upgrade...');
    setIsPremiumUser(true); // Simulate successful upgrade for now
    setIsPremiumModalVisible(false);
  };

  // --- Prop Handlers for EditModal ---
  const handleGradientSelect = (gradientKey: string) => {
    const index = gradientKeys.findIndex(key => key === gradientKey);
    if (index !== -1) {
      setGradientIndex(index);
    }
  };

  const handleEditCustomQR = () => {
    handleCloseEditModal(); 
    handleOpenCreateQRModal(); 
  };

  const handleManageQureQR = () => {
    if (!isPremiumUser) {
      handleCloseEditModal();
      handleOpenPremiumModal();
    }
  };

  // --- Tap Handlers for QR Codes ---
  const handleCustomQRPress = () => {
    handleOpenCreateQRModal(); 
  };

  const handleQureQRPress = () => {
    if (!isPremiumUser) {
      handleOpenPremiumModal(); 
    }
  };

  const currentGradientKey = gradientKeys[gradientIndex]; 

  // --- Screenshot and Export Logic ---
  const handleExportWallpaper = async () => {
    setIsTakingScreenshot(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); 

      const uri = await captureRef(viewToCaptureRef, {
        format: 'png',
        quality: 0.9,
      });
      console.log('Screenshot captured:', uri);
      
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing not available", "Sharing functionality is not available on this device.");
        return;
      }
      
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Could not take or share screenshot!", error);
      Alert.alert("Error", "Could not export wallpaper.");
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  const handleSettings = () => {
    handleOpenEditModal();
  };

  return (
    <GestureDetector gesture={gesture}>
      <ThemedView style={styles.container}>
        <View ref={viewToCaptureRef} style={styles.captureContainer} collapsable={false}>
          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusText}>📶 12:30</Text>
            </View>
            <View style={styles.statusRight}>
              <Text style={styles.statusText}>🔋 92%</Text>
            </View>
          </View>

          {/* Gradient Background */}
          <Animated.View style={[styles.gradientContainer, { opacity: opacityAnim }]}>
            <GradientBackground colors={gradient || blueGradient} />
          </Animated.View>

          {/* Time and Date */}
          <View style={styles.timeDateContainer}>
            <Text style={styles.timeText}>{formattedTime}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          {/* Notification-style buttons */}
          <View style={styles.notificationArea}>
            <TouchableOpacity 
              style={styles.notification} 
              activeOpacity={0.8}
              onPress={handleExportWallpaper}
            >
              <View style={styles.notificationIcon}>
                <Ionicons name="arrow-down-outline" size={20} color="#fff" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Export Wallpaper</Text>
                <Text style={styles.notificationText}>Save to your photos</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.notification} 
              activeOpacity={0.8}
              onPress={handleSettings}
            >
              <View style={styles.notificationIcon}>
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Settings</Text>
                <Text style={styles.notificationText}>Customize your experience</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* QR Codes */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <View style={styles.qrCodeContainer}>
                <QRCodeDisplay
                  value={customQRData}
                  size={68}
                  onPress={handleCustomQRPress}
                  isVisible={true}
                />
              </View>
              <Text style={styles.qrLabel}>YOUR QR CODE</Text>
            </View>
            
            {!isPremiumUser && (
              <View style={styles.qrWrapper}>
                <View style={styles.qrCodeContainer}>
                  <QRCodeDisplay
                    value={qureQRData}
                    size={68}
                    onPress={handleQureQRPress}
                    isVisible={true}
                  />
                </View>
                <Text style={styles.qrLabel}>UPGRADE TO PRO</Text>
                <Text style={styles.lockedIndicator}>🔒</Text>
              </View>
            )}
          </View>

          {/* Indicator dots - keep subtle */}
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
        </View>

        {/* Modals */}
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
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 12,
    zIndex: 50,
  },
  statusLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  timeDateContainer: {
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  timeText: {
    fontSize: 70,
    fontWeight: '200',
    color: 'white',
    textShadow: '0px 2px 10px rgba(0,0,0,0.3)',
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textShadow: '0px 1px 4px rgba(0,0,0,0.3)',
  },
  notificationArea: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
    paddingHorizontal: 20,
  },
  notification: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    width: '90%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginBottom: 3,
  },
  notificationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  qrContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingBottom: 40,
    paddingHorizontal: 30,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
    marginTop: 'auto',
  },
  qrWrapper: {
    alignItems: 'center',
  },
  qrCodeContainer: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  qrLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
  },
  lockedIndicator: {
    fontSize: 10,
    color: 'rgba(255,59,48,0.9)',
    marginTop: 2,
    textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});