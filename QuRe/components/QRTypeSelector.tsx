import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { QRType } from './CreateQRModal';

interface QRTypeSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (type: QRType) => void;
  currentType: QRType;
}

interface QRTypeOption {
  type: QRType;
  label: string;
  icon: string;
  description?: string;
}

const QRTypeSelector: React.FC<QRTypeSelectorProps> = ({
  isVisible,
  onClose,
  onSelect,
  currentType,
}) => {
  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const subtleTextColor = useThemeColor({ light: '#666', dark: '#999' }, 'text');
  const overlayBg = useThemeColor({ light: 'rgba(0,0,0,0.5)', dark: 'rgba(0,0,0,0.7)' }, 'background');

  // QR type options
  const qrTypes: QRTypeOption[] = [
    { type: 'link', label: 'Link', icon: '🔗', description: 'Website or URL link' },
    { type: 'whatsapp', label: 'WhatsApp', icon: '📱', description: 'Open WhatsApp chat' },
    { type: 'email', label: 'E-mail', icon: '✉️', description: 'Email address with subject and body' },
    { type: 'call', label: 'Call', icon: '📞', description: 'Phone number for calls' },
    { type: 'sms', label: 'SMS', icon: '💬', description: 'Send text messages' },
    { type: 'vcard', label: 'V-card', icon: '📇', description: 'Contact information card' },
    { type: 'text', label: 'Text', icon: '📝', description: 'Plain text message' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
              <ThemedText style={styles.title}>Select a QR type</ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
              {qrTypes.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionItem,
                    currentType === option.type && { backgroundColor: `${tintColor}10` },
                    { borderBottomColor: borderColor }
                  ]}
                  onPress={() => {
                    onSelect(option.type);
                    onClose();
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionTextContainer}>
                      <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                      {option.description && (
                        <Text style={[styles.optionDescription, { color: subtleTextColor }]}>
                          {option.description}
                        </Text>
                      )}
                    </View>
                    {currentType === option.type && (
                      <Ionicons name="checkmark" size={24} color={tintColor} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '70%',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    position: 'relative',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
  },
  optionsContainer: {
    flex: 1,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default QRTypeSelector;