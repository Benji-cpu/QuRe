import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LinkFormProps {
  value: string;
  onChange: (value: string) => void;
}

const LinkForm: React.FC<LinkFormProps> = ({ value, onChange }) => {
  const [error, setError] = useState<string | null>(null);

  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const errorColor = '#ef4444';

  const handleTextChange = (input: string) => {
    // Simple validation - check if URL is potentially valid
    if (!input || input === 'https://') {
      setError(null); 
      onChange(input); // Call parent's onChange
      return;
    }

    try {
      let urlToValidate = input;
      if (!input.match(/^https?:\/\//)) {
        urlToValidate = 'https://' + input;
      }
      new URL(urlToValidate);
      setError(null);
      onChange(input); // Pass the original input up, or urlToValidate if you prefer auto-correction
    } catch (e) {
      setError('Please enter a valid URL');
      onChange(input); // Pass the invalid input up so parent knows
    }
  };

  useEffect(() => {
    // Validate the incoming prop value, but only set the error state
    if (!value || value === 'https://') {
      setError(null); 
      return;
    }
    try {
      let urlToValidate = value;
      if (!value.match(/^https?:\/\//)) {
        urlToValidate = 'https://' + value;
      }
      new URL(urlToValidate);
      setError(null);
    } catch (e) {
      setError('Please enter a valid URL');
    }
  }, [value]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter a Link</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor },
          error && { borderColor: errorColor }
        ]}
        value={value}
        onChangeText={handleTextChange}
        placeholder="https://"
        placeholderTextColor={placeholderColor}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        autoComplete="url"
      />
      {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}
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
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default LinkForm;