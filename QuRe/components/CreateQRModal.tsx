import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

// Import QR type components
import LinkForm from './qr-types/LinkForm';
import EmailForm from './qr-types/EmailForm';
import CallForm from './qr-types/CallForm';
import SMSForm from './qr-types/SMSForm';
import VCardForm from './qr-types/VCardForm';
import WhatsAppForm from './qr-types/WhatsAppForm';
import TextForm from './qr-types/TextForm';

// Import QR type selector
import QRTypeSelector from './QRTypeSelector';

// Import QR code designer
import QRCodeDesigner from './qr-styling/QRCodeDesigner';

// QR type definitions
export type QRType = 'link' | 'email' | 'call' | 'sms' | 'vcard' | 'whatsapp' | 'text';

// QR data format interfaces
export interface QRData {
  type: QRType;
  value: string; // The formatted string that will be encoded in the QR
  label?: string; // Optional label for the QR code
  styleOptions?: any; // Options for QR code styling
}

interface CreateQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (qrData: QRData) => void;
  initialValue?: QRData;
  isPremium?: boolean;
}

// Icons for each QR type
const TYPE_ICONS: Record<QRType, string> = {
  link: '🔗',
  whatsapp: '📱',
  email: '✉️',
  call: '📞',
  sms: '💬',
  vcard: '📇',
  text: '📝'
};

const CreateQRModal: React.FC<CreateQRModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValue,
  isPremium = false,
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  
  // State for QR data
  const [qrData, setQrData] = useState<QRData>({ 
    type: 'link', 
    value: 'https://' 
  });
  
  // State for QR styling options
  const [styleOptions, setStyleOptions] = useState<any>(null);
  
  // State for QR type selector visibility
  const [typeSelectVisible, setTypeSelectVisible] = useState(false);
  
  // State for loading state during QR generation
  const [isGenerating, setIsGenerating] = useState(false);

  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const inputBgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'icon');
  const overlayBg = useThemeColor({ light: 'rgba(0,0,0,0.5)', dark: 'rgba(0,0,0,0.7)' }, 'background');

  // Initialize form with initial value if provided
  useEffect(() => {
    if (initialValue) {
      setQrData(initialValue);
      if (initialValue.styleOptions) {
        setStyleOptions(initialValue.styleOptions);
      }
    }
  }, [initialValue]);

  // Ensure QR type display is refreshed when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      // Force refresh of component by creating a new object reference with the same values
      setQrData(current => ({ ...current }));
    }
  }, [isVisible]);

  // Handle QR type selection
  const handleTypeSelect = (type: QRType) => {
    // Default values for each type
    const defaultValues: Record<QRType, string> = {
      link: 'https://',
      email: '',
      call: '',
      sms: '',
      vcard: '',
      whatsapp: '',
      text: ''
    };
    
    setQrData({
      type,
      value: defaultValues[type],
      styleOptions
    });
    setTypeSelectVisible(false);
  };

  // Handle form data update
  const handleFormDataChange = (value: string) => {
    setQrData(prev => ({
      ...prev,
      value
    }));
  };

  // Handle style options change
  const handleStyleChange = (options: any) => {
    setStyleOptions(options);
    setQrData(prev => ({
      ...prev,
      styleOptions: options
    }));
  };

  // Handle save button press
  const handleSave = () => {
    setIsGenerating(true);
    // Simulate generation process
    setTimeout(() => {
      onSave({
        ...qrData,
        styleOptions
      });
      setIsGenerating(false);
    }, 500);
  };

  // Render the current form based on QR type
  const renderForm = () => {
    switch (qrData.type) {
      case 'link':
        return <LinkForm value={qrData.value} onChange={handleFormDataChange} />;
      case 'email':
        return <EmailForm value={qrData.value} onChange={handleFormDataChange} />;
      case 'call':
        return <CallForm value={qrData.value} onChange={handleFormDataChange} />;
      case 'sms':
        return <SMSForm value={qrData.value} onChange={handleFormDataChange} />;
      case 'vcard':
        return <VCardForm value={qrData.value} onChange={handleFormDataChange} />;
      case 'whatsapp':
        return <WhatsAppForm value={qrData.value} onChange={handleFormDataChange} />;
      case 'text':
        return <TextForm value={qrData.value} onChange={handleFormDataChange} />;
      default:
        return <LinkForm value={qrData.value} onChange={handleFormDataChange} />;
    }
  };

  // Get the display name for the QR type
  const getQRTypeDisplayName = (type: QRType): string => {
    const displayNames: Record<QRType, string> = {
      link: 'Link',
      email: 'E-mail',
      call: 'Call',
      sms: 'SMS',
      vcard: 'V-card',
      whatsapp: 'WhatsApp',
      text: 'Text'
    };
    return displayNames[type];
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
        <ThemedView style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            testID="close-button"
          >
            <Ionicons name="close-circle" size={28} color={inactiveColor} />
          </TouchableOpacity>

          {/* Preview QR Code Header */}
          <View style={styles.previewHeader}>
            <ThemedText style={styles.previewTitle}>Preview QR Code</ThemedText>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'content' && styles.activeTab
              ]}
              onPress={() => setActiveTab('content')}
              testID={activeTab === 'content' ? 'content-tab-active' : 'content-tab'}
            >
              <View style={[styles.tabCircle, activeTab === 'content' ? styles.activeTabCircle : {}]}>
                <Text style={styles.tabNumber}>1</Text>
              </View>
              <Text style={[
                styles.tabText,
                activeTab === 'content' && styles.activeTabText
              ]}>
                Content
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'design' && styles.activeTab
              ]}
              onPress={() => setActiveTab('design')}
              testID={activeTab === 'design' ? 'design-tab-active' : 'design-tab'}
            >
              <View style={[styles.tabCircle, activeTab === 'design' ? styles.activeTabCircle : {}]}>
                <Text style={styles.tabNumber}>2</Text>
              </View>
              <Text style={[
                styles.tabText,
                activeTab === 'design' && styles.activeTabText
              ]}>
                Design
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Section */}
          {activeTab === 'content' ? (
            <View style={styles.contentContainer}>
              {/* QR Type Selector Button */}
              <TouchableOpacity
                style={[styles.typeSelector, { borderColor }]}
                onPress={() => setTypeSelectVisible(true)}
                testID="type-selector-button"
              >
                <Text style={[styles.typeSelectorIcon, { color: tintColor }]}>
                  {TYPE_ICONS[qrData.type] || '🔗'}
                </Text>
                <Text style={[styles.typeSelectorText, { color: tintColor }]}>
                  {getQRTypeDisplayName(qrData.type) || 'Link'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={tintColor} />
              </TouchableOpacity>

              {/* Form content */}
              <ScrollView style={styles.formContainer}>
                {renderForm()}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.designContainer}>
              {/* Design options */}
              <QRCodeDesigner 
                data={qrData.value || 'https://example.com'}
                isPremium={isPremium}
                onStyleChange={handleStyleChange}
              />
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.generateButton, 
              (!qrData.value || isGenerating) && styles.disabledButton
            ]}
            onPress={handleSave}
            disabled={!qrData.value || isGenerating}
            testID="generate-button"
          >
            {isGenerating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.generateButtonContent}>
                <Ionicons name="save-outline" size={18} color="white" style={styles.downloadIcon} />
                <Text style={styles.generateButtonText}>
                  Save QR Code
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* QR Type Selector Modal */}
          <QRTypeSelector
            isVisible={typeSelectVisible}
            onClose={() => setTypeSelectVisible(false)}
            onSelect={handleTypeSelect}
            currentType={qrData.type}
          />
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 15,
    padding: 20,
    paddingTop: 25,
    alignItems: 'center',
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  previewHeader: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f7',
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activeTabCircle: {
    backgroundColor: '#10b981',
  },
  tabNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#10b981',
  },
  contentContainer: {
    width: '100%',
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  typeSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  typeSelectorIcon: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    marginBottom: 15,
    maxHeight: 350,
  },
  designContainer: {
    width: '100%',
    flex: 1,
    marginBottom: 15,
  },
  generateButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadIcon: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateQRModal;