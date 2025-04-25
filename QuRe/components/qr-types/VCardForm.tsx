import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface VCardFormProps {
  value: string;
  onChange: (value: string) => void;
}

interface VCardData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  mobileNumber: string;
  email: string;
  website: string;
  company: string;
  jobTitle: string;
  fax: string;
  address: string;
  city: string;
  postCode: string;
  country: string;
}

const VCardForm: React.FC<VCardFormProps> = ({ value, onChange }) => {
  const [formData, setFormData] = useState<VCardData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    mobileNumber: '',
    email: '',
    website: '',
    company: '',
    jobTitle: '',
    fax: '',
    address: '',
    city: '',
    postCode: '',
    country: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof VCardData, string>>>({});

  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const errorColor = '#ef4444';
  const sectionTitleColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

  // Parse initial VCard value if provided
  useEffect(() => {
    if (value && value.startsWith('BEGIN:VCARD')) {
      try {
        parseVCardString(value);
      } catch (e) {
        // If parsing fails, just use empty values
        console.error('Failed to parse vCard:', e);
      }
    }
  }, []);

  // Update the vCard data whenever inputs change
  useEffect(() => {
    validateAndGenerateVCard();
  }, [formData]);

  const parseVCardString = (vcardString: string) => {
    // This is a simplified parser for demonstration
    // A real implementation would need to handle more vCard complexities
    const lines = vcardString.split(/\r\n|\r|\n/);
    const newData = { ...formData };
    
    for (const line of lines) {
      if (line.startsWith('FN:')) {
        const fullName = line.substring(3).split(' ');
        newData.firstName = fullName[0] || '';
        newData.lastName = fullName.slice(1).join(' ') || '';
      } else if (line.startsWith('TEL;TYPE=CELL:')) {
        newData.mobileNumber = line.substring(14);
      } else if (line.startsWith('TEL;TYPE=WORK:')) {
        newData.phoneNumber = line.substring(14);
      } else if (line.startsWith('TEL;TYPE=FAX:')) {
        newData.fax = line.substring(13);
      } else if (line.startsWith('EMAIL:')) {
        newData.email = line.substring(6);
      } else if (line.startsWith('URL:')) {
        newData.website = line.substring(4);
      } else if (line.startsWith('ORG:')) {
        newData.company = line.substring(4);
      } else if (line.startsWith('TITLE:')) {
        newData.jobTitle = line.substring(6);
      } else if (line.startsWith('ADR:')) {
        const addressParts = line.substring(4).split(';');
        newData.address = addressParts[2] || '';
        newData.city = addressParts[3] || '';
        newData.postCode = addressParts[5] || '';
        newData.country = addressParts[6] || '';
      }
    }
    
    setFormData(newData);
  };

  const validateAndGenerateVCard = () => {
    const newErrors: Partial<Record<keyof VCardData, string>> = {};
    
    // Basic validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Enter a valid website URL';
    }
    
    setErrors(newErrors);
    
    // Generate vCard string even if there are errors
    const vcard = generateVCardString();
    onChange(vcard);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      // Add https:// if missing
      const urlToCheck = url.match(/^https?:\/\//) ? url : `https://${url}`;
      new URL(urlToCheck);
      return true;
    } catch (e) {
      return false;
    }
  };

  const generateVCardString = (): string => {
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${formData.firstName} ${formData.lastName}`,
      `N:${formData.lastName};${formData.firstName};;;`,
    ];
    
    if (formData.phoneNumber) {
      vcardLines.push(`TEL;TYPE=WORK:${formData.phoneNumber}`);
    }
    
    if (formData.mobileNumber) {
      vcardLines.push(`TEL;TYPE=CELL:${formData.mobileNumber}`);
    }
    
    if (formData.fax) {
      vcardLines.push(`TEL;TYPE=FAX:${formData.fax}`);
    }
    
    if (formData.email) {
      vcardLines.push(`EMAIL:${formData.email}`);
    }
    
    if (formData.website) {
      // Add https:// if missing
      const website = formData.website.match(/^https?:\/\//) 
        ? formData.website 
        : `https://${formData.website}`;
      vcardLines.push(`URL:${website}`);
    }
    
    if (formData.company) {
      vcardLines.push(`ORG:${formData.company}`);
    }
    
    if (formData.jobTitle) {
      vcardLines.push(`TITLE:${formData.jobTitle}`);
    }
    
    // Add address if at least one address field is filled
    if (formData.address || formData.city || formData.postCode || formData.country) {
      vcardLines.push(`ADR:;;${formData.address};${formData.city};;${formData.postCode};${formData.country}`);
    }
    
    vcardLines.push('END:VCARD');
    
    return vcardLines.join('\n');
  };

  const handleInputChange = (field: keyof VCardData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Personal Information */}
      <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Contact Information</Text>
      
      <View style={styles.row}>
        <View style={styles.halfColumn}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBgColor, color: textColor, borderColor },
              errors.firstName && { borderColor: errorColor }
            ]}
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            placeholder="First name"
            placeholderTextColor={placeholderColor}
          />
          {errors.firstName && <Text style={[styles.errorText, { color: errorColor }]}>{errors.firstName}</Text>}
        </View>
        
        <View style={styles.halfColumn}>
          <Text style={styles.label}>Last name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBgColor, color: textColor, borderColor },
              errors.lastName && { borderColor: errorColor }
            ]}
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            placeholder="Last name"
            placeholderTextColor={placeholderColor}
          />
          {errors.lastName && <Text style={[styles.errorText, { color: errorColor }]}>{errors.lastName}</Text>}
        </View>
      </View>
      
      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={formData.phoneNumber}
        onChangeText={(value) => handleInputChange('phoneNumber', value)}
        placeholder="Phone number"
        placeholderTextColor={placeholderColor}
        keyboardType="phone-pad"
      />
      
      <Text style={styles.label}>Mobile</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={formData.mobileNumber}
        onChangeText={(value) => handleInputChange('mobileNumber', value)}
        placeholder="Mobile number"
        placeholderTextColor={placeholderColor}
        keyboardType="phone-pad"
      />
      
      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor },
          errors.email && { borderColor: errorColor }
        ]}
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        placeholder="Email address"
        placeholderTextColor={placeholderColor}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={[styles.errorText, { color: errorColor }]}>{errors.email}</Text>}
      
      <Text style={styles.label}>Website (URL)</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor },
          errors.website && { borderColor: errorColor }
        ]}
        value={formData.website}
        onChangeText={(value) => handleInputChange('website', value)}
        placeholder="https://"
        placeholderTextColor={placeholderColor}
        keyboardType="url"
        autoCapitalize="none"
      />
      {errors.website && <Text style={[styles.errorText, { color: errorColor }]}>{errors.website}</Text>}
      
      {/* Company Information */}
      <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Company Information</Text>
      
      <Text style={styles.label}>Company</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={formData.company}
        onChangeText={(value) => handleInputChange('company', value)}
        placeholder="Company name"
        placeholderTextColor={placeholderColor}
      />
      
      <View style={styles.row}>
        <View style={styles.halfColumn}>
          <Text style={styles.label}>Job title</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBgColor, color: textColor, borderColor }
            ]}
            value={formData.jobTitle}
            onChangeText={(value) => handleInputChange('jobTitle', value)}
            placeholder="Job title"
            placeholderTextColor={placeholderColor}
          />
        </View>
        
        <View style={styles.halfColumn}>
          <Text style={styles.label}>Fax</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBgColor, color: textColor, borderColor }
            ]}
            value={formData.fax}
            onChangeText={(value) => handleInputChange('fax', value)}
            placeholder="Fax number"
            placeholderTextColor={placeholderColor}
            keyboardType="phone-pad"
          />
        </View>
      </View>
      
      {/* Location */}
      <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Location</Text>
      
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={formData.address}
        onChangeText={(value) => handleInputChange('address', value)}
        placeholder="Street address"
        placeholderTextColor={placeholderColor}
      />
      
      <View style={styles.row}>
        <View style={styles.halfColumn}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBgColor, color: textColor, borderColor }
            ]}
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            placeholder="City"
            placeholderTextColor={placeholderColor}
          />
        </View>
        
        <View style={styles.halfColumn}>
          <Text style={styles.label}>Post code</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBgColor, color: textColor, borderColor }
            ]}
            value={formData.postCode}
            onChangeText={(value) => handleInputChange('postCode', value)}
            placeholder="Post code"
            placeholderTextColor={placeholderColor}
          />
        </View>
      </View>
      
      <Text style={styles.label}>Country</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={formData.country}
        onChangeText={(value) => handleInputChange('country', value)}
        placeholder="Country"
        placeholderTextColor={placeholderColor}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfColumn: {
    width: '48%',
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
    marginBottom: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
  },
});

export default VCardForm;