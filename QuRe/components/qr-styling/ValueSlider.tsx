import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  Platform 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ValueSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  label?: string;
  unit?: string;
  decimalPlaces?: number;
  testID?: string;
}

const ValueSlider: React.FC<ValueSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 0.1,
  label = 'Value',
  unit = '',
  decimalPlaces = 1,
  testID
}) => {
  // Create a formatted display value
  const formatValue = (val: number) => val.toFixed(decimalPlaces);
  
  // State for input value
  const [inputValue, setInputValue] = useState(formatValue(value));
  
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Update the slider value
  const handleSliderChange = (newValue: number) => {
    const roundedValue = Number(newValue.toFixed(decimalPlaces));
    setInputValue(formatValue(roundedValue));
    onValueChange(roundedValue);
  };

  // Handle text input change
  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Convert text to number and validate
    const newValue = Number(text);
    if (!isNaN(newValue) && newValue >= minimumValue && newValue <= maximumValue) {
      onValueChange(newValue);
    }
  };

  // Update the value when input field loses focus
  const handleInputBlur = () => {
    const newValue = Number(inputValue);
    
    // If value is invalid or out of range, reset to current value
    if (isNaN(newValue) || newValue < minimumValue || newValue > maximumValue) {
      setInputValue(formatValue(value));
    } else {
      // Round to the specified decimal places
      const roundedValue = Number(newValue.toFixed(decimalPlaces));
      setInputValue(formatValue(roundedValue));
      onValueChange(roundedValue);
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        {label && (
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        )}
        <View style={styles.valueContainer}>
          <TextInput
            style={[
              styles.valueInput,
              { color: textColor, backgroundColor: inputBgColor, borderColor }
            ]}
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            keyboardType="numeric"
            selectTextOnFocus
            maxLength={5}
            testID={`${testID}-input`}
          />
          {unit && (
            <Text style={[styles.unitText, { color: textColor }]}>{unit}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={[styles.rangeText, { color: textColor }]}>
          {minimumValue}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          value={value}
          onValueChange={handleSliderChange}
          minimumTrackTintColor={tintColor}
          maximumTrackTintColor={borderColor}
          thumbTintColor={tintColor}
          testID={`${testID}-slider`}
        />
        <Text style={[styles.rangeText, { color: textColor }]}>
          {maximumValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueInput: {
    width: 50,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 5,
    textAlign: 'center',
  },
  unitText: {
    marginLeft: 5,
    fontSize: 14,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    ...Platform.select({
      ios: {
        marginHorizontal: 5,
      },
      android: {
        marginHorizontal: 10,
      },
    }),
  },
  rangeText: {
    fontSize: 12,
    width: 30,
    textAlign: 'center',
  },
});

export default ValueSlider; 