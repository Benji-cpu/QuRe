import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

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