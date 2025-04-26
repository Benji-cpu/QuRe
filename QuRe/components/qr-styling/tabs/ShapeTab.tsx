import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

interface ShapeTabProps {
  shape: 'square' | 'circle';
  onShapeChange: (shape: 'square' | 'circle') => void;
}

const ShapeTab: React.FC<ShapeTabProps> = ({
  shape,
  onShapeChange,
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');

  return (
    <View style={styles.container} testID="shape-tab">
      <Text style={[styles.label, { color: textColor }]}>QR Code Shape</Text>
      
      <View style={styles.optionsContainer}>
        {/* Square Option */}
        <TouchableOpacity
          style={[
            styles.shapeOption,
            { borderColor },
            shape === 'square' && [styles.selectedOption, { borderColor: tintColor }]
          ]}
          onPress={() => onShapeChange('square')}
          testID="square-option"
        >
          <View style={[styles.square, { backgroundColor: shape === 'square' ? tintColor : borderColor }]} />
          <Text 
            style={[
              styles.optionLabel, 
              { color: textColor },
              shape === 'square' && { color: tintColor, fontWeight: '600' }
            ]}
          >
            Square
          </Text>
        </TouchableOpacity>

        {/* Circle Option */}
        <TouchableOpacity
          style={[
            styles.shapeOption,
            { borderColor },
            shape === 'circle' && [styles.selectedOption, { borderColor: tintColor }]
          ]}
          onPress={() => onShapeChange('circle')}
          testID="circle-option"
        >
          <View style={[styles.circle, { backgroundColor: shape === 'circle' ? tintColor : borderColor }]} />
          <Text 
            style={[
              styles.optionLabel, 
              { color: textColor },
              shape === 'circle' && { color: tintColor, fontWeight: '600' }
            ]}
          >
            Circle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Message */}
      <View style={[styles.infoContainer, { backgroundColor: bgColor, borderColor }]}>
        <Ionicons name="information-circle-outline" size={20} color={textColor} />
        <Text style={[styles.infoText, { color: textColor }]}>
          Circular QR codes may not be readable by all scanners. Use with caution.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  shapeOption: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  selectedOption: {
    borderWidth: 2,
  },
  square: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default ShapeTab; 