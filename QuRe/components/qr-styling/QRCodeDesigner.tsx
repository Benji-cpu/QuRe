import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import ColorPicker from './ColorPicker';
import ValueSlider from './ValueSlider';
import { Switch } from 'react-native';

interface QRCodeDesignerProps {
  data: string;
  isPremium?: boolean;
  onStyleChange?: (options: any) => void;
}

const QRCodeDesigner: React.FC<QRCodeDesignerProps> = ({
  data,
  isPremium = false,
  onStyleChange,
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  
  // State for basic QR code styling options
  const [qrColor, setQrColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [enableGradient, setEnableGradient] = useState<boolean>(false);
  const [gradientStart, setGradientStart] = useState<string>('#FF0000');
  const [gradientEnd, setGradientEnd] = useState<string>('#0000FF');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<string>('M');
  
  // Update parent component with style changes
  const updateParent = (newOptions: any) => {
    if (onStyleChange) {
      const options = {
        size: 200, // Fixed size
        color: qrColor,
        backgroundColor: bgColor,
        enableLinearGradient: enableGradient,
        linearGradient: [gradientStart, gradientEnd],
        quietZone: 0, // Hardcode quietZone to 0
        ecl: errorCorrectionLevel,
        ...newOptions
      };
      onStyleChange(options);
    }
  };

  // Handler for color change
  const handleColorChange = (color: string) => {
    setQrColor(color);
    updateParent({ color });
  };

  // Handler for background color change
  const handleBgColorChange = (color: string) => {
    setBgColor(color);
    updateParent({ backgroundColor: color });
  };

  // Handler for gradient toggle
  const handleGradientToggle = (value: boolean) => {
    setEnableGradient(value);
    updateParent({ enableLinearGradient: value });
  };

  // Handler for gradient start color change
  const handleGradientStartChange = (color: string) => {
    setGradientStart(color);
    updateParent({ linearGradient: [color, gradientEnd] });
  };

  // Handler for gradient end color change
  const handleGradientEndChange = (color: string) => {
    setGradientEnd(color);
    updateParent({ linearGradient: [gradientStart, color] });
  };

  return (
    <ScrollView style={styles.container} testID="qr-code-designer">
      {/* QR Color Picker */}
      <ColorPicker
        color={qrColor}
        onColorChange={handleColorChange}
        label="QR Code Color"
        testID="qr-color-picker"
      />

      {/* Background Color Picker */}
      <ColorPicker
        color={bgColor}
        onColorChange={handleBgColorChange}
        label="Background Color"
        testID="bg-color-picker"
      />

      {/* Gradient Toggle */}
      <View style={styles.toggleRow}>
        <Text style={[styles.label, { color: textColor }]}>Use Gradient</Text>
        <Switch
          value={enableGradient}
          onValueChange={handleGradientToggle}
          trackColor={{ false: borderColor, true: tintColor }}
          thumbColor="#fff"
          testID="gradient-switch"
        />
      </View>

      {/* Gradient Options (only show if gradient is enabled) */}
      {enableGradient && (
        <View style={styles.gradientSection}>
          <ColorPicker
            color={gradientStart}
            onColorChange={handleGradientStartChange}
            label="Gradient Start Color"
            testID="gradient-start-picker"
          />
          <ColorPicker
            color={gradientEnd}
            onColorChange={handleGradientEndChange}
            label="Gradient End Color"
            testID="gradient-end-picker"
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  gradientSection: {
    marginTop: 8,
    marginBottom: 16,
  }
});

export default QRCodeDesigner;