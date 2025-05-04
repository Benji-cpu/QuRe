import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { EnhancedQRCodeDisplay } from '@/components/qr-base';
import { QRCodeItem } from '@/context/QRCodeTypes';
import { Ionicons } from '@expo/vector-icons';

interface QRCodeSectionProps {
  customQRCode: QRCodeItem | null;
  customQRValue: string;
  qureQRData: string;
  onCustomQRPress: () => void;
  onQureQRPress: () => void;
  isPremiumUser: boolean;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  customQRCode,
  customQRValue,
  qureQRData,
  onCustomQRPress,
  onQureQRPress,
  isPremiumUser,
}) => {
  const isPlaceholder = !customQRCode || customQRCode.id === 'user-default';
  const displayLabel = isPlaceholder ? "Create QR Code" : customQRCode?.label || 'My QR Code';

  return (
    <View style={styles.qrContainer}>
      <View style={styles.qrWrapper}>
        {isPlaceholder ? (
          <TouchableOpacity 
            style={styles.placeholderContainer} 
            onPress={onCustomQRPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={40} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        ) : (
          <View style={styles.qrCodeContainer}>
            <EnhancedQRCodeDisplay
              value={customQRValue || 'https://example.com'}
              size={70}
              onPress={onCustomQRPress}
              isVisible={true}
              styleOptions={customQRCode?.styleOptions}
            />
          </View>
        )}
        <Text style={styles.qrLabel}>{displayLabel.toUpperCase()}</Text>
      </View>
      
      {!isPremiumUser && (
        <View style={styles.qrWrapper}>
          <View style={styles.qrCodeContainer}>
            <EnhancedQRCodeDisplay
              value={qureQRData || 'https://qure.app/download'}
              size={70}
              onPress={onQureQRPress}
              isVisible={true}
            />
          </View>
          <Text style={styles.qrLabel}>UPGRADE TO PRO</Text>
          <Text style={styles.lockedIndicator}>🔒</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  qrContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
    marginTop: 'auto',
    marginBottom: 60,
  },
  qrWrapper: {
    alignItems: 'center',
    width: 100,
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
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  qrLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  lockedIndicator: {
    fontSize: 10,
    color: 'rgba(255,59,48,0.9)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
});

export default QRCodeSection;