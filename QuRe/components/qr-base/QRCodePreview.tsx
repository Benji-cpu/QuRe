import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeColor } from '@/hooks/useThemeColor';

interface QRCodePreviewProps {
  value: string;
  size?: number;
  showLabel?: boolean;
  labelText?: string;
  isGenerating?: boolean;
  styleOptions?: {
    color?: string;
    backgroundColor?: string;
    enableLinearGradient?: boolean;
    linearGradient?: string[];
    logo?: any;
    logoSize?: number;
    logoBackgroundColor?: string;
    logoMargin?: number;
    quietZone?: number;
    ecl?: 'L' | 'M' | 'Q' | 'H';
  };
}

const QRCodePreview: React.FC<QRCodePreviewProps> = memo(({
  value,
  size = 180,
  showLabel = true,
  labelText = '',
  isGenerating = false,
  styleOptions
}) => {
  const backgroundColor = useThemeColor({ light: '#F7F7F7', dark: '#2A2A2A' }, 'background');
  
  const safeValue = value && typeof value === 'string' && value.trim() !== '' ? 
    value : 'https://example.com';
    
  const getQRType = () => {
    if (value.startsWith('http')) return 'LINK';
    if (value.startsWith('mailto')) return 'EMAIL';
    if (value.startsWith('tel')) return 'CALL';
    if (value.startsWith('sms')) return 'SMS';
    if (value.startsWith('BEGIN:VCARD')) return 'CONTACT';
    if (value.startsWith('https://wa.me/')) return 'WHATSAPP';
    return 'TEXT';
  };
  
  return (
    <View style={[styles.previewArea, { backgroundColor }]}>
      <View style={[styles.qrContainer, { width: size + 20, height: size + 20 }]}>
        {isGenerating ? (
          <ActivityIndicator size="large" color="#10b981" />
        ) : (
          <QRCode 
            value={safeValue}
            size={size}
            color={styleOptions?.color}
            backgroundColor={styleOptions?.backgroundColor}
            enableLinearGradient={styleOptions?.enableLinearGradient}
            linearGradient={styleOptions?.linearGradient}
            logo={styleOptions?.logo}
            logoSize={styleOptions?.logoSize}
            logoBackgroundColor={styleOptions?.logoBackgroundColor}
            logoMargin={styleOptions?.logoMargin}
            quietZone={styleOptions?.quietZone}
            ecl={styleOptions?.ecl || 'M'}
          />
        )}
      </View>
      
      <View style={styles.labelContainer}>
        <Text style={styles.typeLabel}>{getQRType()}</Text>
        
        {showLabel && (
          <Text style={styles.qrLabel}>
            {labelText ? labelText.toUpperCase() : `${getQRType()} QR CODE`}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  previewArea: {
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 12,
  },
  qrContainer: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 10,
    marginBottom: 5,
  },
  labelContainer: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.6)',
    letterSpacing: 0.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  qrLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.8)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  placeholderLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  }
});

export default QRCodePreview;