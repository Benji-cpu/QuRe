import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  TextInput,
  ScrollView
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  label?: string;
  testID?: string;
}

// Predefined color palette
const colorPalette = [
  '#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', 
  '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', 
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', 
  '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B'
];

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onColorChange, 
  label = 'Color',
  testID 
}) => {
  const [inputValue, setInputValue] = useState(color);
  
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Handle color input change
  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Validate if it's a proper hex color (basic validation)
    if (/^#([0-9A-F]{3}){1,2}$/i.test(text)) {
      onColorChange(text);
    }
  };

  // Handle selecting a color from the palette
  const handleColorSelect = (selectedColor: string) => {
    setInputValue(selectedColor);
    onColorChange(selectedColor);
  };

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      
      <View style={styles.inputRow}>
        <View style={[styles.colorPreview, { backgroundColor: color, borderColor }]} />
        <TextInput
          style={[
            styles.input, 
            { color: textColor, backgroundColor: inputBgColor, borderColor }
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder="#RRGGBB"
          placeholderTextColor="#999"
          autoCapitalize="characters"
          maxLength={7}
          testID={`${testID}-input`}
        />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.paletteScroll}
        contentContainerStyle={styles.paletteContainer}
      >
        {colorPalette.map((paletteColor) => (
          <TouchableOpacity
            key={paletteColor}
            style={[
              styles.colorOption,
              { backgroundColor: paletteColor, borderColor },
              paletteColor === color && [styles.selectedColor, { borderColor: tintColor }]
            ]}
            onPress={() => handleColorSelect(paletteColor)}
            testID={`${testID}-option-${paletteColor.replace('#', '')}`}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorPreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  paletteScroll: {
    maxHeight: 50,
  },
  paletteContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
  },
  selectedColor: {
    borderWidth: 3,
  },
});

export default ColorPicker;