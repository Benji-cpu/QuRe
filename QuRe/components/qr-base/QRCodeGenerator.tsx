import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
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
  onGenerated?: (success: boolean, svgRef?: any) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  enableLinearGradient = false,
  linearGradient = ['#FF0000', '#0000FF'],
  logo,
  logoSize,
  logoBackgroundColor,
  logoMargin = 2,
  quietZone = 0,
  ecl = 'M',
  onGenerated
}) => {
  // Reference to the QR code SVG element
  const qrRef = React.useRef(null);

  // Call onGenerated when ref is available
  React.useEffect(() => {
    if (qrRef.current && onGenerated) {
      onGenerated(true, qrRef.current);
    }
  }, [qrRef, onGenerated]);

  return (
    <View style={styles.container}>
      {value ? (
        <QRCode
          value={value}
          size={size}
          color={color}
          backgroundColor={backgroundColor}
          enableLinearGradient={enableLinearGradient}
          linearGradient={linearGradient}
          logo={logo}
          logoSize={logoSize}
          logoBackgroundColor={logoBackgroundColor}
          logoMargin={logoMargin}
          quietZone={quietZone}
          ecl={ecl}
          getRef={(c) => {
            qrRef.current = c;
          }}
        />
      ) : (
        <ActivityIndicator size="large" color="#10b981" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default QRCodeGenerator;