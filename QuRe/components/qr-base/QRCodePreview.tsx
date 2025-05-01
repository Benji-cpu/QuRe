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
  showLabel = false,
  labelText = 'SCAN ME',
  isGenerating = false,
  styleOptions
}) => {
  const backgroundColor = useThemeColor({ light: '#F7F7F7', dark: '#2A2A2A' }, 'background');
  
  const safeValue = value && typeof value === 'string' && value.trim() !== '' ? 
    value : 'https://example.com';
  
  return (
    <View style={[styles.previewArea, { backgroundColor }]}>
      <View style={[styles.qrContainer, { width: size + 40, height: size + 40 }]}>
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
        <Text style={styles.typeLabel}>
          {value && value.startsWith('http') ? 'LINK' : ''}
        </Text>
        {showLabel && (
          <Text style={styles.qrLabel}>{labelText.toUpperCase()}</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  previewArea: {
    paddingVertical: 20,
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
    borderRadius: 12,
    marginBottom: 10,
  },
  labelContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    letterSpacing: 0.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  qrLabel: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.8)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  }
});

export default QRCodePreview;