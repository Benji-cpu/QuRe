import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TextFormProps {
  value: string;
  onChange: (value: string) => void;
}

const TextForm: React.FC<TextFormProps> = ({ value, onChange }) => {
  const [text, setText] = useState(value || '');
  
  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const errorColor = '#ef4444';

  useEffect(() => {
    // Update parent with text value
    onChange(text);
  }, [text]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Text Content</Text>
      <TextInput
        style={[
          styles.textInput,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={text}
        onChangeText={setText}
        placeholder="Enter your text message here"
        placeholderTextColor={placeholderColor}
        multiline
        numberOfLines={6}
      />
      <Text style={[styles.charCount, { color: textColor }]}>
        {text.length} characters
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 150,
    marginBottom: 5,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
});

export default TextForm;