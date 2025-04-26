import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Switch, 
  Text, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColor } from '@/hooks/useThemeColor';

import ValueSlider from '../ValueSlider';

// Predefined logos
const predefinedLogos = [
  { id: 'none', uri: null, label: 'None' },
  { id: 'paypal', uri: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/paypal_logo_icon_170865.png', label: 'PayPal' },
  { id: 'bitcoin', uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968260.png', label: 'Bitcoin' },
  { id: 'email', uri: 'https://cdn-icons-png.flaticon.com/512/732/732200.png', label: 'Email' },
  { id: 'whatsapp', uri: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png', label: 'WhatsApp' },
  { id: 'wifi', uri: 'https://cdn-icons-png.flaticon.com/512/93/93160.png', label: 'WiFi' },
];

interface LogoTabProps {
  logoImage?: string;
  logoSize: number;
  logoHideBackgroundDots: boolean;
  logoMargin: number;
  onLogoChange: (imageUri: string | undefined) => void;
  onLogoSizeChange: (size: number) => void;
  onLogoHideDotsChange: (hide: boolean) => void;
  onLogoMarginChange: (margin: number) => void;
  isPremium?: boolean;
}

const LogoTab: React.FC<LogoTabProps> = ({
  logoImage,
  logoSize,
  logoHideBackgroundDots,
  logoMargin,
  onLogoChange,
  onLogoSizeChange,
  onLogoHideDotsChange,
  onLogoMarginChange,
  isPremium = false,
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Handle logo image selection from gallery
  const handlePickImage = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Custom logo upload is a premium feature. Upgrade to Premium to access this feature.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select a logo.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onLogoChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was an error selecting your image. Please try again.');
    }
  };

  // Handle predefined logo selection
  const handleSelectPredefinedLogo = (logo: typeof predefinedLogos[0]) => {
    onLogoChange(logo.uri || undefined);
  };

  // Check if a predefined logo is selected
  const getSelectedLogoId = () => {
    if (!logoImage) return 'none';
    const found = predefinedLogos.find(logo => logo.uri === logoImage);
    return found ? found.id : 'custom';
  };

  const selectedLogoId = getSelectedLogoId();

  return (
    <View style={styles.container} testID="logo-tab">
      {/* Logo Upload Button */}
      <TouchableOpacity 
        style={[styles.uploadButton, { borderColor }]} 
        onPress={handlePickImage}
        testID="logo-upload-button"
      >
        <Ionicons name="cloud-upload-outline" size={24} color={tintColor} />
        <Text style={[styles.buttonText, { color: textColor }]}>
          {isPremium ? 'Upload Custom Logo' : 'Upload Custom Logo (Premium)'}
        </Text>
      </TouchableOpacity>

      {/* Predefined Logos */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Predefined Logos</Text>
      <View style={styles.logosGrid}>
        {predefinedLogos.map((logo) => (
          <TouchableOpacity
            key={logo.id}
            style={[
              styles.logoOption, 
              { borderColor },
              selectedLogoId === logo.id && [styles.selectedLogo, { borderColor: tintColor }]
            ]}
            onPress={() => handleSelectPredefinedLogo(logo)}
            testID={`logo-option-${logo.id}`}
          >
            {logo.uri ? (
              <Image source={{ uri: logo.uri }} style={styles.logoImage} />
            ) : (
              <View style={[styles.emptyLogo, { backgroundColor: bgColor }]} />
            )}
            <Text 
              style={[
                styles.logoLabel, 
                { color: textColor },
                selectedLogoId === logo.id && { color: tintColor }
              ]}
            >
              {logo.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logo Display Settings (only visible if a logo is selected) */}
      {logoImage && (
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Logo Settings</Text>
          
          {/* Logo Size Slider */}
          <ValueSlider
            value={logoSize}
            onValueChange={onLogoSizeChange}
            minimumValue={0.1}
            maximumValue={0.9}
            step={0.05}
            label="Logo Size"
            testID="logo-size-slider"
          />
          
          {/* Logo Margin Slider */}
          <ValueSlider
            value={logoMargin}
            onValueChange={onLogoMarginChange}
            minimumValue={0}
            maximumValue={20}
            step={1}
            label="Margin"
            unit="px"
            decimalPlaces={0}
            testID="logo-margin-slider"
          />
          
          {/* Hide Background Dots Toggle */}
          <View style={styles.toggleRow}>
            <Text style={[styles.label, { color: textColor }]}>Hide Background Dots</Text>
            <Switch
              value={logoHideBackgroundDots}
              onValueChange={onLogoHideDotsChange}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
              testID="hide-dots-switch"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 15,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  logosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  logoOption: {
    width: 80,
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  selectedLogo: {
    borderWidth: 2,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  emptyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  logoLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingsContainer: {
    marginTop: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LogoTab; 