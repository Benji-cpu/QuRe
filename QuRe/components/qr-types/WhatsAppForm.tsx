import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Platform, ScrollView, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import countryList from '@/utils/countryCodeList';

interface WhatsAppFormProps {
  value: string;
  onChange: (value: string) => void;
}

interface CountryOption {
  code: string;
  name: string;
  display: string;
}

const WhatsAppForm: React.FC<WhatsAppFormProps> = ({ value, onChange }) => {
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // To prevent infinite updates
  const isInitialMount = useRef(true);
  const isUpdatingFromProps = useRef(false);
  
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

  // Parse initial value if provided - only runs once on mount
  useEffect(() => {
    if (isInitialMount.current && value) {
      isUpdatingFromProps.current = true;
      
      try {
        console.log('Initial WhatsApp URL parsing for:', value);
        
        // Check if it's a valid WhatsApp URL
        if (value.startsWith('https://wa.me/')) {
          // Extract phone and message from URL
          const url = new URL(value);
          const fullNumber = url.pathname.substring(1); // Remove leading slash
          const textParam = url.searchParams.get('text') || '';

          // Check for NaN and handle invalid numbers
          if (fullNumber && fullNumber !== 'NaN' && fullNumber !== 'undefined' && /^[0-9]+$/.test(fullNumber)) {
            // Extract country code and phone number
            if (fullNumber.length > 10) {
              // Determine country code length (1-3 digits based on total length)
              const ccLength = fullNumber.length > 12 ? 3 : (fullNumber.length > 11 ? 2 : 1);
              const cc = fullNumber.substring(0, ccLength);
              const phone = fullNumber.substring(ccLength);
              
              setCountryCode(cc);
              setPhoneNumber(phone);
              
              // Select the country based on code
              const matchingCountry = countryOptions.find(c => c.code === cc);
              if (matchingCountry) {
                setSelectedCountry(matchingCountry);
              }
            } else {
              setPhoneNumber(fullNumber);
            }
            
            setMessage(textParam);
          } else {
            // Invalid number - set default empty values
            console.log('Invalid WhatsApp number detected:', fullNumber);
            setCountryCode('');
            setPhoneNumber('');
            setMessage('');
          }
        }
      } catch (e) {
        // If parsing fails, set default values
        console.error('Error parsing WhatsApp URL:', e);
        setCountryCode('');
        setPhoneNumber('');
        setMessage('');
      }
      
      isInitialMount.current = false;
      isUpdatingFromProps.current = false;
    }
  }, []); // Empty dependency array - run only once on mount

  // Update the WhatsApp URL whenever inputs change manually
  useEffect(() => {
    // Skip this update if it's coming from props initially
    if (isUpdatingFromProps.current || isInitialMount.current) {
      return;
    }
    
    // Check for invalid values to prevent creating bad URLs
    if (phoneNumber === 'NaN' || phoneNumber === 'undefined') {
      return;
    }
    
    if (validatePhone()) {
      // Format phone number with country code if selected
      let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (countryCode) {
        formattedNumber = `${countryCode}${formattedNumber}`;
      }
      
      // Create WhatsApp URL format: https://wa.me/123456789?text=Hello
      const encodedMessage = encodeURIComponent(message);
      
      // Only include text parameter if there's a message
      const textParam = message ? `?text=${encodedMessage}` : '';
      
      // Build complete WhatsApp URL
      let whatsappUrl = `https://wa.me/${formattedNumber}${textParam}`;
      onChange(whatsappUrl);
    }
  }, [countryCode, phoneNumber, message, onChange]);

  const validatePhone = (): boolean => {
    // Check for invalid values
    if (!phoneNumber || phoneNumber === 'NaN' || phoneNumber === 'undefined') {
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

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country);
    setCountryCode(country.code);
    setShowCountryModal(false);
    setSearchQuery(''); // Clear search when a country is selected
  };
  
  // Safe phone number input handler
  const handlePhoneNumberChange = (text: string) => {
    // Prevent setting to 'NaN' or 'undefined' strings
    if (text === 'NaN' || text === 'undefined') {
      setPhoneNumber('');
    } else {
      setPhoneNumber(text);
    }
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
        onChangeText={handlePhoneNumberChange}
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

export default WhatsAppForm;