import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, TouchableOpacity, Text as RNText, StyleSheet as RNStyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QRCodeProvider } from '@/context/QRCodeContext';
import { PremiumProvider } from '@/context/PremiumContext';
import UserPreferencesService from '@/services/UserPreferences';
import PurchaseService from '@/services/PurchaseService';
import OnboardingModal from '@/components/OnboardingModal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [forceShowDebugOnboarding, setForceShowDebugOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (hasSeen === null) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error("Failed to read onboarding status from storage", e);
      } finally {
        setIsLoadingOnboarding(false);
      }
    };

    checkOnboardingStatus();

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const handleCloseOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      if (forceShowDebugOnboarding) {
        setForceShowDebugOnboarding(false);
      } else {
        setShowOnboarding(false);
      }
    } catch (e) {
      console.error("Failed to save onboarding status to storage", e);
      setShowOnboarding(false);
      setForceShowDebugOnboarding(false);
    }
  };

  const toggleDebugOnboarding = () => {
    setForceShowDebugOnboarding(!forceShowDebugOnboarding);
    if (!forceShowDebugOnboarding) {
      setShowOnboarding(true);
    }
  };

  // Initialize app services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Track app open
        await UserPreferencesService.trackAppOpen();
        
        // Initialize purchase system
        await PurchaseService.initializePurchases();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    initializeApp();
  }, []);

  if (!loaded || isLoadingOnboarding) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <PremiumProvider>
            <QRCodeProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ headerShown: false }} />
              </Stack>
              <View style={debugStyles.testButtonContainer}>
                <TouchableOpacity onPress={toggleDebugOnboarding} style={[debugStyles.testButton, debugStyles.onboardingButton]}>
                  <RNText style={debugStyles.testButtonText}>Toggle Onboarding</RNText>
                </TouchableOpacity>
              </View>
              <StatusBar style="light" />
              <OnboardingModal visible={showOnboarding || forceShowDebugOnboarding} onClose={handleCloseOnboarding} />
            </QRCodeProvider>
          </PremiumProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const debugStyles = RNStyleSheet.create({
  testButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  testButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  onboardingButton: {
    backgroundColor: '#ff9500',
  },
  testButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});