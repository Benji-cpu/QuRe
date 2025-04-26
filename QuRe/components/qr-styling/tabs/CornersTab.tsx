import React from 'react';
import { View, StyleSheet, Switch, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

import ColorPicker from '../ColorPicker';
import StyleSelector from '../StyleSelector';
import ExpandableSection from '../ExpandableSection';
import ValueSlider from '../ValueSlider';

interface CornersTabProps {
  // Corner Square props
  squareType?: string;
  squareColor?: string;
  squareHasGradient: boolean;
  squareGradientType: 'linear' | 'radial';
  squareGradientStartColor: string;
  squareGradientEndColor: string;
  squareGradientRotation: number;
  
  // Corner Dot props
  dotType?: string;
  dotColor?: string;
  dotHasGradient: boolean;
  dotGradientType: 'linear' | 'radial';
  dotGradientStartColor: string;
  dotGradientEndColor: string;
  dotGradientRotation: number;
  
  // Callbacks for Corner Square
  onSquareTypeChange: (type: string) => void;
  onSquareColorChange: (color: string) => void;
  onSquareGradientChange: (useGradient: boolean) => void;
  onSquareGradientTypeChange: (type: 'linear' | 'radial') => void;
  onSquareGradientStartColorChange: (color: string) => void;
  onSquareGradientEndColorChange: (color: string) => void;
  onSquareGradientRotationChange: (rotation: number) => void;
  
  // Callbacks for Corner Dot
  onDotTypeChange: (type: string) => void;
  onDotColorChange: (color: string) => void;
  onDotGradientChange: (useGradient: boolean) => void;
  onDotGradientTypeChange: (type: 'linear' | 'radial') => void;
  onDotGradientStartColorChange: (color: string) => void;
  onDotGradientEndColorChange: (color: string) => void;
  onDotGradientRotationChange: (rotation: number) => void;
}

// Available corner square styles
const cornerSquareStyleOptions = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'none', label: 'None' },
];

// Available corner dot styles
const cornerDotStyleOptions = [
  { value: 'dot', label: 'Dot' },
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'none', label: 'None' },
];

const CornersTab: React.FC<CornersTabProps> = ({
  // Corner Square props
  squareType = 'square',
  squareColor = '#000000',
  squareHasGradient,
  squareGradientType,
  squareGradientStartColor,
  squareGradientEndColor,
  squareGradientRotation,
  
  // Corner Dot props
  dotType = 'dot',
  dotColor = '#000000',
  dotHasGradient,
  dotGradientType,
  dotGradientStartColor,
  dotGradientEndColor,
  dotGradientRotation,
  
  // Callbacks for Corner Square
  onSquareTypeChange,
  onSquareColorChange,
  onSquareGradientChange,
  onSquareGradientTypeChange,
  onSquareGradientStartColorChange,
  onSquareGradientEndColorChange,
  onSquareGradientRotationChange,
  
  // Callbacks for Corner Dot
  onDotTypeChange,
  onDotColorChange,
  onDotGradientChange,
  onDotGradientTypeChange,
  onDotGradientStartColorChange,
  onDotGradientEndColorChange,
  onDotGradientRotationChange,
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container} testID="corners-tab">
      {/* Corner Squares Section */}
      <ExpandableSection 
        title="Corner Squares" 
        initiallyExpanded={true}
        icon="◻️"
        testID="corner-squares-section"
      >
        {/* Square Style Selector */}
        <StyleSelector
          options={cornerSquareStyleOptions}
          selectedValue={squareType}
          onSelect={onSquareTypeChange}
          label="Style"
          testID="square-style-selector"
        />

        {squareType !== 'none' && (
          <>
            {/* Color Picker */}
            {!squareHasGradient && (
              <ColorPicker
                color={squareColor}
                onColorChange={onSquareColorChange}
                label="Color"
                testID="square-color-picker"
              />
            )}

            {/* Gradient Toggle */}
            <View style={styles.toggleRow}>
              <Text style={[styles.label, { color: textColor }]}>Use Gradient</Text>
              <Switch
                value={squareHasGradient}
                onValueChange={onSquareGradientChange}
                trackColor={{ false: borderColor, true: tintColor }}
                thumbColor="#fff"
                testID="square-gradient-switch"
              />
            </View>

            {/* Gradient Options */}
            {squareHasGradient && (
              <View style={styles.gradientContainer}>
                {/* Gradient Type */}
                <View style={styles.optionRow}>
                  <Text style={[styles.label, { color: textColor }]}>Gradient Type</Text>
                  <View style={styles.typeButtonsContainer}>
                    <Text
                      style={[
                        styles.typeButton,
                        { borderColor },
                        squareGradientType === 'linear' && { backgroundColor: tintColor, color: '#fff', borderColor: tintColor }
                      ]}
                      onPress={() => onSquareGradientTypeChange('linear')}
                    >
                      Linear
                    </Text>
                    <Text
                      style={[
                        styles.typeButton,
                        { borderColor },
                        squareGradientType === 'radial' && { backgroundColor: tintColor, color: '#fff', borderColor: tintColor }
                      ]}
                      onPress={() => onSquareGradientTypeChange('radial')}
                    >
                      Radial
                    </Text>
                  </View>
                </View>

                {/* Gradient Start Color */}
                <ColorPicker
                  color={squareGradientStartColor}
                  onColorChange={onSquareGradientStartColorChange}
                  label="Start Color"
                  testID="square-gradient-start-color"
                />

                {/* Gradient End Color */}
                <ColorPicker
                  color={squareGradientEndColor}
                  onColorChange={onSquareGradientEndColorChange}
                  label="End Color"
                  testID="square-gradient-end-color"
                />

                {/* Gradient Rotation (for linear) */}
                {squareGradientType === 'linear' && (
                  <ValueSlider
                    value={squareGradientRotation}
                    onValueChange={onSquareGradientRotationChange}
                    minimumValue={0}
                    maximumValue={360}
                    step={1}
                    label="Rotation"
                    unit="°"
                    decimalPlaces={0}
                    testID="square-gradient-rotation-slider"
                  />
                )}
              </View>
            )}
          </>
        )}
      </ExpandableSection>

      {/* Corner Dots Section */}
      <ExpandableSection 
        title="Corner Dots" 
        initiallyExpanded={false}
        icon="⚫"
        testID="corner-dots-section"
      >
        {/* Dot Style Selector */}
        <StyleSelector
          options={cornerDotStyleOptions}
          selectedValue={dotType}
          onSelect={onDotTypeChange}
          label="Style"
          testID="dot-style-selector"
        />

        {dotType !== 'none' && (
          <>
            {/* Color Picker */}
            {!dotHasGradient && (
              <ColorPicker
                color={dotColor}
                onColorChange={onDotColorChange}
                label="Color"
                testID="dot-color-picker"
              />
            )}

            {/* Gradient Toggle */}
            <View style={styles.toggleRow}>
              <Text style={[styles.label, { color: textColor }]}>Use Gradient</Text>
              <Switch
                value={dotHasGradient}
                onValueChange={onDotGradientChange}
                trackColor={{ false: borderColor, true: tintColor }}
                thumbColor="#fff"
                testID="dot-gradient-switch"
              />
            </View>

            {/* Gradient Options */}
            {dotHasGradient && (
              <View style={styles.gradientContainer}>
                {/* Gradient Type */}
                <View style={styles.optionRow}>
                  <Text style={[styles.label, { color: textColor }]}>Gradient Type</Text>
                  <View style={styles.typeButtonsContainer}>
                    <Text
                      style={[
                        styles.typeButton,
                        { borderColor },
                        dotGradientType === 'linear' && { backgroundColor: tintColor, color: '#fff', borderColor: tintColor }
                      ]}
                      onPress={() => onDotGradientTypeChange('linear')}
                    >
                      Linear
                    </Text>
                    <Text
                      style={[
                        styles.typeButton,
                        { borderColor },
                        dotGradientType === 'radial' && { backgroundColor: tintColor, color: '#fff', borderColor: tintColor }
                      ]}
                      onPress={() => onDotGradientTypeChange('radial')}
                    >
                      Radial
                    </Text>
                  </View>
                </View>

                {/* Gradient Start Color */}
                <ColorPicker
                  color={dotGradientStartColor}
                  onColorChange={onDotGradientStartColorChange}
                  label="Start Color"
                  testID="dot-gradient-start-color"
                />

                {/* Gradient End Color */}
                <ColorPicker
                  color={dotGradientEndColor}
                  onColorChange={onDotGradientEndColorChange}
                  label="End Color"
                  testID="dot-gradient-end-color"
                />

                {/* Gradient Rotation (for linear) */}
                {dotGradientType === 'linear' && (
                  <ValueSlider
                    value={dotGradientRotation}
                    onValueChange={onDotGradientRotationChange}
                    minimumValue={0}
                    maximumValue={360}
                    step={1}
                    label="Rotation"
                    unit="°"
                    decimalPlaces={0}
                    testID="dot-gradient-rotation-slider"
                  />
                )}
              </View>
            )}
          </>
        )}
      </ExpandableSection>
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
  gradientContainer: {
    marginTop: 10,
  },
});

export default CornersTab; 