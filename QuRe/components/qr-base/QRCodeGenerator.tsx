import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeColor } from '@/hooks/useThemeColor';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  styleOptions?: any;
  onGenerated?: (success: boolean, svgRef?: any) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  styleOptions,
  onGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrRef, setQrRef] = useState<any>(null);
  
  // Apply styling options for QR code
  const getQROptions = () => {
    if (!styleOptions) {
      return {
        backgroundColor: 'white',
        color: 'black'
      };
    }
    
    const options = {
      backgroundColor: styleOptions.backgroundOptions?.color || 'white',
      color: styleOptions.dotsOptions?.color || 'black',
      logo: styleOptions.image,
      logoSize: styleOptions.imageOptions?.imageSize ? size * styleOptions.imageOptions.imageSize : undefined,
      logoBackgroundColor: styleOptions.imageOptions?.hideBackgroundDots ? 'white' : undefined,
      logoMargin: styleOptions.imageOptions?.margin || 0,
      quietZone: styleOptions.frameOptions?.enabled ? styleOptions.frameOptions.width : undefined,
    };
    
    if (styleOptions.backgroundOptions?.color === 'transparent') {
      options.backgroundColor = 'transparent';
    }
    
    return options;
  };
  
  const qrOptions = getQROptions();
  
  // Notify parent when QR code is generated
  useEffect(() => {
    if (qrRef && onGenerated) {
      onGenerated(true, qrRef);
    }
  }, [qrRef, onGenerated]);
  
  return (
    <View style={styles.container}>
      {isGenerating ? (
        <ActivityIndicator size="large" color="#10b981" />
      ) : (
        value ? (
          <QRCode 
            value={value}
            size={size}
            getRef={(ref) => setQrRef(ref)}
            {...qrOptions}
          />
        ) : (
          <View style={[styles.emptyQR, { width: size, height: size }]} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyQR: {
    backgroundColor: '#EEEEEE',
  }
});

export default QRCodeGenerator;
