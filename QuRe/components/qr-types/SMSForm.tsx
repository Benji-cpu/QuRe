import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import countryList from '@/utils/countryCodeList';

interface SMSFormProps {
  value: string;
  onChange: (value: string) => void;
}

interface CountryOption {
  code: string;
  name: string;
  display: string;
}

const SMSForm: React.FC<SMSFormProps> = ({ value, onChange }) => {
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Format country list for display
  const countryOptions: CountryOption[] = countryList.map(country => ({
    code: country.code,
    name: country.name,
    display: `${country.name} (+${country.code})`
  }));

  // Filter country options based on search query
  const filteredCountryOptions = searchQuery.trim() === '' 
    ? countryOptions 
    : countryOptions.filter(country => {
        const query = searchQuery.toLowerCase();
        return country.name.toLowerCase().includes(query) || 
               country.code.toLowerCase().includes(query);
      });

  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const errorColor = '#ef4444';
  const accentColor = useThemeColor({}, 'tint');
  const overlayBg = useThemeColor({ light: 'rgba(0,0,0,0.5)', dark: 'rgba(0,0,0,0.7)' }, 'background');

  // Parse initial value if provided
  useEffect(() => {
    if (value && value.startsWith('sms:')) {
      try {
        // Parse the SMS URL to extract number and message
        const smsPattern = /^sms:([^?]+)(?:\?body=(.*))?$/;
        const matches = value.match(smsPattern);
        
        if (matches) {
          const number = matches[1];
          const body = matches[2] ? decodeURIComponent(matches[2]) : '';
          
          setPhoneNumber(number);
          setMessage(body);
        }
      } catch (e) {
        // If parsing fails, just use empty values
        setCountryCode('');
        setPhoneNumber('');
        setMessage('');
      }
    }
  }, []);

  // Update the SMS URL whenever inputs change
  useEffect(() => {
    if (validatePhone()) {
      // Format the phone number with country code if selected
      let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (countryCode) {
        formattedNumber = `+${countryCode}${formattedNumber}`;
      }
      
      // Create SMS URL format: sms:+123456789?body=Hello
      let smsUrl = `sms:${formattedNumber}`;
      
      // Add message body if present
      if (message) {
        const encodedMessage = encodeURIComponent(message);
        smsUrl += `?body=${encodedMessage}`;
      }
      
      onChange(smsUrl);
    } else if (phoneNumber) {
      // Even if validation fails, still update with current value for preview
      onChange(`sms:${phoneNumber}`);
    }
  }, [countryCode, phoneNumber, message]);

  const validatePhone = (): boolean => {
    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return false;
    }

    // Basic validation for phone numbers
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    if (!phoneRegex.test(cleanNumber)) {
      setPhoneError('Enter a valid phone number');
      return false;
    }

    setPhoneError(null);
    return true;
  };

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country);
    setCountryCode(country.code);
    setShowCountryModal(false);
    setSearchQuery(''); // Clear search when a country is selected
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>Country code</Text>
      
      {/* Custom country selector */}
      <TouchableOpacity 
        style={[
          styles.countrySelector, 
          { backgroundColor: inputBgColor, borderColor }
        ]}
        onPress={() => setShowCountryModal(true)}
      >
        <Text style={{ color: selectedCountry ? textColor : placeholderColor }}>
          {selectedCountry ? selectedCountry.display : 'Select a country code'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={textColor} />
      </TouchableOpacity>

      <Text style={[styles.label, { color: textColor }]}>Phone number</Text>
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

      <Text style={[styles.label, { color: textColor }]}>Message</Text>
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

      {/* Country selector modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCountryModal(false);
          setSearchQuery(''); // Clear search when modal is closed
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Select Country</Text>
                <TouchableOpacity onPress={() => {
                  setShowCountryModal(false);
                  setSearchQuery(''); // Clear search when modal is closed
                }}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>
              
              {/* Search input */}
              <View style={[styles.searchContainer, { borderBottomColor: borderColor }]}>
                <Ionicons name="search" size={20} color={placeholderColor} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Search country or code..."
                  placeholderTextColor={placeholderColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                  returnKeyType="search"
                  autoFocus={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color={placeholderColor} />
                  </TouchableOpacity>
                )}
              </View>
              
              <ScrollView style={styles.countryList}>
                {filteredCountryOptions.length === 0 ? (
                  <View style={styles.noResults}>
                    <Text style={[styles.noResultsText, { color: textColor }]}>
                      No countries found matching "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  filteredCountryOptions.map((country, index) => (
                    <TouchableOpacity
                      key={`country-${country.code}-${index}`}
                      style={[
                        styles.countryItem, 
                        { borderBottomColor: borderColor },
                        selectedCountry?.code === country.code && { backgroundColor: `${accentColor}15` }
                      ]}
                      onPress={() => handleCountrySelect(country)}
                    >
                      <Text style={[styles.countryName, { color: textColor }]}>
                        {country.name}
                      </Text>
                      <Text style={[styles.countryCode, { color: placeholderColor }]}>
                        +{country.code}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
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
  countrySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
  },
  countryName: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SMSForm;