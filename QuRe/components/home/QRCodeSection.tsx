import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { EnhancedQRCodeDisplay } from '@/components/qr-base';
import { QRCodeItem } from '@/context/QRCodeTypes';
import { Ionicons } from '@expo/vector-icons';

interface QRCodeSectionProps {
  primaryQRCodeItem: QRCodeItem | null;
  secondaryQRCodeItem: QRCodeItem | null;
  defaultBrandedQRCodeItem: QRCodeItem | null;
  primaryQRValue: string;
  secondaryQRValue: string;
  defaultBrandedQRValue: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  isPremiumUser: boolean;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  primaryQRCodeItem,
  secondaryQRCodeItem,
  defaultBrandedQRCodeItem,
  primaryQRValue,
  secondaryQRValue,
  defaultBrandedQRValue,
  onPrimaryPress,
  onSecondaryPress,
  isPremiumUser,
}) => {
  const isPrimaryPlaceholder = !primaryQRCodeItem || primaryQRCodeItem.id === 'user-default';
  const primaryDisplayLabel = isPrimaryPlaceholder ? "Create QR Code" : primaryQRCodeItem?.label || 'My QR Code';

  const isSecondaryPlaceholder = isPremiumUser && !secondaryQRCodeItem;
  const secondaryDisplayLabel = isPremiumUser 
    ? (secondaryQRCodeItem?.label || 'Create QR Code') 
    : 'UPGRADE TO PRO';

  return (
    <View style={styles.qrContainer}>
      <View style={styles.qrWrapper}>
        {isPrimaryPlaceholder ? (
          <TouchableOpacity style={styles.placeholderContainer} onPress={onPrimaryPress} activeOpacity={0.7}>
            <Ionicons name="add" size={40} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        ) : (
          <View style={styles.qrCodeContainer}>
            <EnhancedQRCodeDisplay
              value={primaryQRValue || 'https://example.com'}
              size={70}
              onPress={onPrimaryPress}
              isVisible={true}
              styleOptions={primaryQRCodeItem?.styleOptions}
            />
          </View>
        )}
        <Text style={styles.qrLabel}>{primaryDisplayLabel.toUpperCase()}</Text>
      </View>
      
      <View style={styles.qrWrapper}>
        {isPremiumUser ? (
          isSecondaryPlaceholder ? (
            <TouchableOpacity style={styles.placeholderContainer} onPress={onSecondaryPress} activeOpacity={0.7}>
              <Ionicons name="add" size={40} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ) : (
            <View style={styles.qrCodeContainer}>
              <EnhancedQRCodeDisplay
                value={secondaryQRValue || 'https://example.com/custom2'}
                size={70}
                onPress={onSecondaryPress}
                isVisible={true}
                styleOptions={secondaryQRCodeItem?.styleOptions}
              />
            </View>
          )
        ) : (
          <View style={styles.qrCodeContainer}>
            <EnhancedQRCodeDisplay
              value={defaultBrandedQRValue || 'https://qure.app/download'}
              size={70}
              onPress={onSecondaryPress}
              isVisible={true}
              styleOptions={{
                ...(defaultBrandedQRCodeItem?.styleOptions || {}),
                quietZone: 0,
              }}
            />
          </View>
        )}
        <Text style={styles.qrLabel}>{secondaryDisplayLabel.toUpperCase()}</Text>
        {!isPremiumUser && <Text style={styles.lockedIndicator}>🔒</Text>} 
      </View>
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