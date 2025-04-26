import React from 'react';
import { View, StyleSheet, Switch, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

import ColorPicker from '../ColorPicker';
import StyleSelector from '../StyleSelector';
import ExpandableSection from '../ExpandableSection';
import ValueSlider from '../ValueSlider';

interface DotsTabProps {
  color: string;
  type: string;
  hasGradient: boolean;
  gradientType: 'linear' | 'radial';
  gradientStartColor: string;
  gradientEndColor: string;
  gradientRotation: number;
  onColorChange: (color: string) => void;
  onTypeChange: (type: string) => void;
  onGradientChange: (useGradient: boolean) => void;
  onGradientTypeChange: (type: 'linear' | 'radial') => void;
  onGradientStartColorChange: (color: string) => void;
  onGradientEndColorChange: (color: string) => void;
  onGradientRotationChange: (rotation: number) => void;
}

// Available dot styles
const dotStyleOptions = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

const DotsTab: React.FC<DotsTabProps> = ({
  color,
  type,
  hasGradient,
  gradientType,
  gradientStartColor,
  gradientEndColor,
  gradientRotation,
  onColorChange,
  onTypeChange,
  onGradientChange,
  onGradientTypeChange,
  onGradientStartColorChange,
  onGradientEndColorChange,
  onGradientRotationChange,
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container} testID="dots-tab">
      {/* Dot Style Selector */}
      <StyleSelector
        options={dotStyleOptions}
        selectedValue={type}
        onSelect={onTypeChange}
        label="Dot Style"
        testID="dot-style-selector"
      />

      {/* Color Picker */}
      {!hasGradient && (
        <ColorPicker
          color={color}
          onColorChange={onColorChange}
          label="Dot Color"
          testID="dot-color-picker"
        />
      )}

      {/* Gradient Toggle */}
      <View style={styles.toggleRow}>
        <Text style={[styles.label, { color: textColor }]}>Use Gradient</Text>
        <Switch
          value={hasGradient}
          onValueChange={onGradientChange}
          trackColor={{ false: borderColor, true: tintColor }}
          thumbColor="#fff"
          testID="gradient-switch"
        />
      </View>

      {/* Gradient Options */}
      {hasGradient && (
        <ExpandableSection 
          title="Gradient Options" 
          initiallyExpanded={true}
          testID="gradient-section"
        >
          {/* Gradient Type */}
          <View style={styles.optionRow}>
            <Text style={[styles.label, { color: textColor }]}>Gradient Type</Text>
            <View style={styles.typeButtonsContainer}>
              <Text
                style={[
                  styles.typeButton,
                  { borderColor },
                  gradientType === 'linear' && { backgroundColor: tintColor, color: '#fff', borderColor: tintColor }
                ]}
                onPress={() => onGradientTypeChange('linear')}
              >
                Linear
              </Text>
              <Text
                style={[
                  styles.typeButton,
                  { borderColor },
                  gradientType === 'radial' && { backgroundColor: tintColor, color: '#fff', borderColor: tintColor }
                ]}
                onPress={() => onGradientTypeChange('radial')}
              >
                Radial
              </Text>
            </View>
          </View>

          {/* Gradient Start Color */}
          <ColorPicker
            color={gradientStartColor}
            onColorChange={onGradientStartColorChange}
            label="Start Color"
            testID="gradient-start-color"
          />

          {/* Gradient End Color */}
          <ColorPicker
            color={gradientEndColor}
            onColorChange={onGradientEndColorChange}
            label="End Color"
            testID="gradient-end-color"
          />

          {/* Gradient Rotation (for linear) */}
          {gradientType === 'linear' && (
            <ValueSlider
              value={gradientRotation}
              onValueChange={onGradientRotationChange}
              minimumValue={0}
              maximumValue={360}
              step={1}
              label="Rotation"
              unit="°"
              decimalPlaces={0}
              testID="gradient-rotation-slider"
            />
          )}
        </ExpandableSection>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
  },
  typeButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
    fontSize: 14,
  },
});

export default DotsTab; 