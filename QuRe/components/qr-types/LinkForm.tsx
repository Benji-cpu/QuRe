import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LinkFormProps {
  value: string;
  onChange: (value: string) => void;
}

const LinkForm: React.FC<LinkFormProps> = ({ value, onChange }) => {
  const [url, setUrl] = useState(value || 'https://');
  const [error, setError] = useState<string | null>(null);

  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const errorColor = '#ef4444';

  useEffect(() => {
    validateAndUpdate(url);
  }, [url]);

  const validateAndUpdate = (input: string) => {
    // Simple validation - check if URL is potentially valid
    if (!input || input === 'https://') {
      setError(null); // Don't show error for empty or default value
      onChange(input);
      return;
    }

    // Basic validation for URL format
    try {
      // Add https:// if missing
      let urlToValidate = input;
      if (!input.match(/^https?:\/\//)) {
        urlToValidate = 'https://' + input;
      }

      // Try to construct a URL to validate
      new URL(urlToValidate);
      setError(null);
      onChange(urlToValidate); // Use the validated URL with https:// if it was added
    } catch (e) {
      setError('Please enter a valid URL');
      onChange(input); // Still update the value despite the error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter a Link</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor },
          error && { borderColor: errorColor }
        ]}
        value={url}
        onChangeText={setUrl}
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