import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { EnhancedQRCodeDisplay } from '@/components/qr-base';

interface QRCodeSectionProps {
  customQRData: string;
  qureQRData: string;
  customQRStyleOptions?: any;
  onCustomQRPress: () => void;
  onQureQRPress: () => void;
  isPremiumUser: boolean;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  customQRData,
  qureQRData,
  customQRStyleOptions,
  onCustomQRPress,
  onQureQRPress,
  isPremiumUser,
}) => {
  return (
    <View style={styles.qrContainer}>
      <View style={styles.qrWrapper}>
        <View style={styles.qrCodeContainer}>
          <EnhancedQRCodeDisplay
            value={customQRData || 'https://qr.io/'}
            size={70}
            onPress={onCustomQRPress}
            isVisible={true}
            styleOptions={customQRStyleOptions}
          />
        </View>
        <Text style={styles.qrLabel}>YOUR QR CODE</Text>
      </View>
      
      {!isPremiumUser && (
        <View style={styles.qrWrapper}>
          <View style={styles.qrCodeContainer}>
            <EnhancedQRCodeDisplay
              value={qureQRData || 'https://qr.io/'}
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
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lockedIndicator: {
    fontSize: 10,
    color: 'rgba(255,59,48,0.9)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default QRCodeSection;