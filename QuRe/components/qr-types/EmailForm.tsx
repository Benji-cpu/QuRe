import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface EmailFormProps {
  value: string;
  onChange: (value: string) => void;
}

const EmailForm: React.FC<EmailFormProps> = ({ value, onChange }) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const errorColor = '#ef4444';

  // Parse initial value if provided
  useEffect(() => {
    if (value && value.startsWith('mailto:')) {
      try {
        // Extract email, subject, and body from mailto URL
        const mailtoPattern = /^mailto:([^?]+)(?:\?(?:subject=([^&]*))?(?:&body=([^&]*))?)?$/;
        const matches = value.match(mailtoPattern);
        
        if (matches) {
          setEmail(decodeURIComponent(matches[1] || ''));
          setSubject(decodeURIComponent(matches[2] || ''));
          setMessage(decodeURIComponent(matches[3] || ''));
        }
      } catch (e) {
        // If parsing fails, just use empty values
        setEmail('');
        setSubject('');
        setMessage('');
      }
    }
  }, []);

  // Update the mailto URL whenever inputs change
  useEffect(() => {
    if (validateEmail()) {
      // Create mailto URL format: mailto:email@example.com?subject=Subject&body=Message
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(message);
      
      // Build URL parts
      let mailtoUrl = `mailto:${email}`;
      
      // Add subject and body parameters if they exist
      const params = [];
      if (subject) params.push(`subject=${encodedSubject}`);
      if (message) params.push(`body=${encodedBody}`);
      
      if (params.length > 0) {
        mailtoUrl += `?${params.join('&')}`;
      }
      
      onChange(mailtoUrl);
    } else {
      // If email is invalid, still update with current value for preview
      onChange(`mailto:${email}`);
    }
  }, [email, subject, message]);

  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('Email address is required');
      return false;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Enter a valid email address');
      return false;
    }

    setEmailError(null);
    return true;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor },
          emailError && { borderColor: errorColor }
        ]}
        value={email}
        onChangeText={setEmail}
        placeholder="Your Email Address"
        placeholderTextColor={placeholderColor}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      {emailError && <Text style={[styles.errorText, { color: errorColor }]}>{emailError}</Text>}

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBgColor, color: textColor, borderColor }
        ]}
        value={subject}
        onChangeText={setSubject}
        placeholder="Subject Of Email"
        placeholderTextColor={placeholderColor}
      />

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

export default EmailForm;