import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeColor } from '@/hooks/useThemeColor';

interface QRCodePreviewProps {
  value: string;
  size?: number;
  showLabel?: boolean;
  labelText?: string;
  isGenerating?: boolean;
  styleOptions?: any;
}

const QRCodePreview: React.FC<QRCodePreviewProps> = ({
  value,
  size = 180,
  showLabel = false,
  labelText = 'SCAN ME',
  isGenerating = false,
  styleOptions
}) => {
  const backgroundColor = useThemeColor({ light: '#F7F7F7', dark: '#2A2A2A' }, 'background');
  
  const qrOptions = useMemo(() => {
    if (!styleOptions) {
      return {
        backgroundColor: 'white',
        color: 'black'
      };
    }
    
    // If styleOptions has nested options property, use that
    const options = styleOptions.options || styleOptions;
    
    // Extract styling properties
    const result = {
      backgroundColor: options.backgroundOptions?.color || 'white',
      color: options.dotsOptions?.color || 'black',
      logo: options.image,
      logoSize: options.imageOptions?.imageSize ? size * options.imageOptions.imageSize : undefined,
      logoBackgroundColor: options.imageOptions?.hideBackgroundDots ? 'white' : undefined,
      logoMargin: options.imageOptions?.margin || 0,
      quietZone: styleOptions.frameOptions?.enabled ? styleOptions.frameOptions.width : undefined,
    };
    
    if (options.backgroundOptions?.color === 'transparent') {
      result.backgroundColor = 'transparent';
    }
    
    return result;
  }, [styleOptions, size]);

  return (
    <View style={[styles.previewArea, { backgroundColor }]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{labelText}</Text>
        </View>
      )}
      
      <View style={[styles.qrContainer, { width: size + 40, height: size + 40 }]}>
        {isGenerating ? (
          <ActivityIndicator size="large" color="#10b981" />
        ) : (
          value ? (
            <QRCode 
              value={value}
              size={size}
              {...qrOptions}
            />
          ) : (
            <View style={[styles.emptyQR, { width: size, height: size }]} />
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewArea: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 12,
  },
  labelContainer: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  labelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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
  },
  emptyQR: {
    backgroundColor: '#EEEEEE',
  },
});

export default QRCodePreview;