import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image 
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface StyleOption {
  value: string;
  label: string;
  imageSource?: any; // For preview images
}

interface StyleSelectorProps {
  options: StyleOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label?: string;
  testID?: string;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  label = 'Style',
  testID
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const selectedBgColor = useThemeColor({ light: '#e6f7ff', dark: '#0a374e' }, 'background');

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              { borderColor },
              selectedValue === option.value && [styles.selectedOption, { borderColor: tintColor, backgroundColor: selectedBgColor }]
            ]}
            onPress={() => onSelect(option.value)}
            testID={`${testID}-option-${option.value}`}
          >
            {option.imageSource ? (
              <Image 
                source={option.imageSource} 
                style={styles.optionImage} 
                resizeMode="contain"
              />
            ) : (
              <View 
                style={[
                  styles.optionPlaceholder, 
                  { backgroundColor: bgColor }
                ]} 
              />
            )}
            <Text 
              style={[
                styles.optionLabel, 
                { color: textColor },
                selectedValue === option.value && { color: tintColor }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  option: {
    width: 80,
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  optionPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginBottom: 5,
  },
  optionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StyleSelector; 