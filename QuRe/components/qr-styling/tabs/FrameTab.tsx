import React from 'react';
import { 
  View, 
  StyleSheet, 
  Switch, 
  Text, 
  TextInput,
  TouchableOpacity 
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

import ColorPicker from '../ColorPicker';
import StyleSelector from '../StyleSelector';
import ValueSlider from '../ValueSlider';

interface FrameTabProps {
  enabled: boolean;
  style: string;
  width: number;
  color: string;
  text?: string;
  textColor?: string;
  fontFamily?: string;
  onEnabledChange: (enabled: boolean) => void;
  onStyleChange: (style: string) => void;
  onWidthChange: (width: number) => void;
  onColorChange: (color: string) => void;
  onTextChange: (text: string) => void;
  onTextColorChange: (color: string) => void;
  onFontFamilyChange: (fontFamily: string) => void;
  isPremium?: boolean;
}

// Available frame styles
const frameStyles = [
  { value: 'basic', label: 'Basic' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'fancy', label: 'Fancy' },
];

// Available font families
const fontFamilies = [
  { value: 'default', label: 'Default' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
];

const FrameTab: React.FC<FrameTabProps> = ({
  enabled,
  style,
  width,
  color,
  text = '',
  textColor = '#000000',
  fontFamily = 'default',
  onEnabledChange,
  onStyleChange,
  onWidthChange,
  onColorChange,
  onTextChange,
  onTextColorChange,
  onFontFamilyChange,
  isPremium = false,
}) => {
  // Get theme colors
  const textThemeColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const handlePremiumFeatureClick = () => {
    if (!isPremium) {
      alert('This is a premium feature. Upgrade to access custom frames.');
    }
  };

  return (
    <View style={styles.container} testID="frame-tab">
      {/* Frame Enable Toggle */}
      <View style={styles.toggleRow}>
        <Text style={[styles.label, { color: textThemeColor }]}>Enable Frame</Text>
        <Switch
          value={enabled}
          onValueChange={isPremium ? onEnabledChange : handlePremiumFeatureClick}
          trackColor={{ false: borderColor, true: tintColor }}
          thumbColor="#fff"
          testID="frame-toggle"
        />
      </View>

      {/* Premium Badge (if not premium) */}
      {!isPremium && (
        <View style={[styles.premiumBadge, { borderColor: tintColor, backgroundColor: inputBgColor }]}>
          <Text style={[styles.premiumText, { color: tintColor }]}>Premium Feature</Text>
        </View>
      )}

      {/* Frame Options (only if enabled and premium) */}
      {enabled && isPremium && (
        <>
          {/* Frame Style Selector */}
          <StyleSelector
            options={frameStyles}
            selectedValue={style}
            onSelect={onStyleChange}
            label="Frame Style"
            testID="frame-style-selector"
          />

          {/* Frame Width Slider */}
          <ValueSlider
            value={width}
            onValueChange={onWidthChange}
            minimumValue={2}
            maximumValue={30}
            step={1}
            label="Frame Width"
            unit="px"
            decimalPlaces={0}
            testID="frame-width-slider"
          />

          {/* Frame Color Picker */}
          <ColorPicker
            color={color}
            onColorChange={onColorChange}
            label="Frame Color"
            testID="frame-color-picker"
          />

          {/* Frame Text Input */}
          <Text style={[styles.label, { color: textThemeColor }]}>Frame Text</Text>
          <TextInput
            style={[
              styles.textInput,
              { color: textThemeColor, backgroundColor: inputBgColor, borderColor }
            ]}
            value={text}
            onChangeText={onTextChange}
            placeholder="Add text to your frame (optional)"
            placeholderTextColor="#999"
            testID="frame-text-input"
          />

          {/* Text Color Picker (only if text is entered) */}
          {text.trim() !== '' && (
            <>
              <ColorPicker
                color={textColor}
                onColorChange={onTextColorChange}
                label="Text Color"
                testID="text-color-picker"
              />

              {/* Font Family Selector */}
              <Text style={[styles.label, { color: textThemeColor, marginTop: 10 }]}>Font Family</Text>
              <View style={styles.fontFamilyContainer}>
                {fontFamilies.map((font) => (
                  <TouchableOpacity
                    key={font.value}
                    style={[
                      styles.fontOption,
                      { borderColor },
                      fontFamily === font.value && { backgroundColor: tintColor }
                    ]}
                    onPress={() => onFontFamilyChange(font.value)}
                    testID={`font-option-${font.value}`}
                  >
                    <Text 
                      style={[
                        styles.fontOptionText,
                        { color: textThemeColor },
                        font.value === 'serif' && styles.serifFont,
                        font.value === 'monospace' && styles.monospaceFont,
                        fontFamily === font.value && { color: '#fff' }
                      ]}
                    >
                      {font.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </>
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
    marginBottom: 8,
  },
  premiumBadge: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '500',
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  fontFamilyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  fontOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  fontOptionText: {
    fontSize: 14,
  },
  serifFont: {
    fontFamily: 'serif',
  },
  monospaceFont: {
    fontFamily: 'monospace',
  },
});

export default FrameTab; 