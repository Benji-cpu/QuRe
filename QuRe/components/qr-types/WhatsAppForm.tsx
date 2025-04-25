import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeColor } from '@/hooks/useThemeColor';
import countryList from '@/utils/countryCodeList';

interface WhatsAppFormProps {
  value: string;
  onChange: (value: string) => void;
}

const WhatsAppForm: React.FC<WhatsAppFormProps> = ({ value, onChange }) => {
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const errorColor = '#ef4444';

  // Parse initial value if provided
  useEffect(() => {
    if (value && value.startsWith('https://wa.me/')) {
      try {
        // Extract phone and message from URL
        const url = new URL(value);
        const path = url.pathname.substring(1); // Remove leading slash
        const textParam = url.searchParams.get('text') || '';

        // Try to extract country code and number
        let countryCodeValue = '';
        let phoneNumberValue = path;
        
        // This is simplified - in a real app you'd need more robust parsing
        setPhoneNumber(phoneNumberValue);
        setCountryCode(countryCodeValue || '--');
        setMessage(textParam);
      } catch (e) {
        // If parsing fails, set default values
        setCountryCode('--');
        setPhoneNumber('');
        setMessage('');
      }
    }
  }, []);

  // Update the WhatsApp URL whenever inputs change
  useEffect(() => {
    if (validatePhone()) {
      // Create WhatsApp URL format: https://wa.me/123456789?text=Hello
      const fullNumber = phoneNumber.replace(/[^0-9]/g, '');
      const encodedMessage = encodeURIComponent(message);
      
      // Only include text parameter if there's a message
      const textParam = message ? `?text=${encodedMessage}` : '';
      
      // Build complete WhatsApp URL
      let whatsappUrl = `https://wa.me/${fullNumber}${textParam}`;
      onChange(whatsappUrl);
    }
  }, [countryCode, phoneNumber, message]);

  const validatePhone = (): boolean => {
    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return false;
    }

    // Basic validation for phone numbers
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[^0-9+]/g, ''))) {
      setPhoneError('Enter a valid phone number');
      return false;
    }

    setPhoneError(null);
    return true;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Country code</Text>
      <View style={[
        styles.pickerContainer,
        { backgroundColor: inputBgColor, borderColor }
      ]}>
        <Picker
          selectedValue={countryCode}
          onValueChange={(itemValue) => setCountryCode(itemValue)}
          style={[styles.picker, { color: textColor }]}
        >
          <Picker.Item label="--" value="--" />
          {countryList.map(country => (
            <Picker.Item 
              key={country.code} 
              label={`${country.name} (+${country.code})`} 
              value={country.code} 
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor },
          phoneError && { borderColor: errorColor }
        ]}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone number"
        placeholderTextColor={placeholderColor}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      {phoneError && <Text style={[styles.errorText, { color: errorColor }]}>{phoneError}</Text>}

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[
          styles.messageInput,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={message}
        onChangeText={setMessage}
        placeholder="Message"
        placeholderTextColor={placeholderColor}
        multiline
        numberOfLines={4}
      />
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  messageInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
  },
});

export default WhatsAppForm;