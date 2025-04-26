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
import { QRType } from './CreateQRModal';

interface QRTypeSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (type: QRType) => void;
  currentType: QRType;
}

// QR type definitions with descriptions
const QR_TYPE_INFO = {
  link: {
    title: 'Link',
    description: 'Website or URL link',
    icon: 'link-outline'
  },
  whatsapp: {
    title: 'WhatsApp',
    description: 'Open WhatsApp chat',
    icon: 'logo-whatsapp'
  },
  email: {
    title: 'E-mail',
    description: 'Email address with subject and body',
    icon: 'mail-outline'
  },
  call: {
    title: 'Call',
    description: 'Phone number for calls',
    icon: 'call-outline'
  },
  sms: {
    title: 'SMS',
    description: 'Send text messages',
    icon: 'chatbubble-outline'
  },
  vcard: {
    title: 'V-card',
    description: 'Contact information card',
    icon: 'card-outline'
  },
  text: {
    title: 'Text',
    description: 'Plain text message',
    icon: 'document-text-outline'
  }
};

const QRTypeSelector: React.FC<QRTypeSelectorProps> = ({
  isVisible,
  onClose,
  onSelect,
  currentType
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>Select a QR type</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {Object.entries(QR_TYPE_INFO).map(([type, info]) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionItem,
                    currentType === type && styles.selectedOption
                  ]}
                  onPress={() => onSelect(type as QRType)}
                >
                  <View style={styles.optionIconContainer}>
                    <Ionicons name={info.icon} size={24} color="#000" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{info.title}</Text>
                    <Text style={styles.optionDescription}>{info.description}</Text>
                  </View>
                  {currentType === type && (
                    <Ionicons name="checkmark" size={24} color="#10b981" />
                  )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    backgroundColor: 'white',
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedOption: {
    backgroundColor: '#E4F7EE',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
});

export default QRTypeSelector;