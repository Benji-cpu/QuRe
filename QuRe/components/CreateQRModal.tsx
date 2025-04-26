import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

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
  
  // State for QR data - initialize with default values
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

  // Render form content for content tab
  const renderFormContent = () => {
    // Always show the form content regardless of tab
    // This ensures the form is visible when modal first opens
    switch (qrData.type) {
      case 'link':
        return (
          <View style={styles.formContent}>
            <Text style={styles.formLabel}>Enter your Website</Text>
            <TextInput 
              style={styles.textInput}
              value={qrData.value || 'https://'}
              onChangeText={handleFormDataChange}
              placeholder="https://"
            />
          </View>
        );
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
        // Fallback to link form as default
        return (
          <View style={styles.formContent}>
            <Text style={styles.formLabel}>Enter your Website</Text>
            <TextInput 
              style={styles.textInput}
              value={'https://'}
              onChangeText={handleFormDataChange}
              placeholder="https://"
            />
          </View>
        );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Preview QR Code</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* QR Preview area */}
          <View style={styles.previewArea}>
            <View style={styles.scanMeContainer}>
              <Text style={styles.scanMeText}>SCAN ME</Text>
            </View>
            <View style={styles.qrContainer}>
              {qrData.value ? (
                <QRCode 
                  value={qrData.value}
                  size={220}
                  backgroundColor="white"
                  color="black"
                />
              ) : (
                <View style={styles.emptyQR} />
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'content' && styles.activeTab]}
              onPress={() => setActiveTab('content')}
            >
              <View style={[styles.tabCircle, activeTab === 'content' && styles.activeTabCircle]}>
                <Text style={styles.tabNumber}>1</Text>
              </View>
              <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>Content</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'design' && styles.activeTab]}
              onPress={() => setActiveTab('design')}
            >
              <View style={[styles.tabCircle, activeTab === 'design' && styles.activeTabCircle]}>
                <Text style={styles.tabNumber}>2</Text>
              </View>
              <Text style={[styles.tabText, activeTab === 'design' && styles.activeTabText]}>Design</Text>
            </TouchableOpacity>
          </View>

          {/* Content area */}
          <View style={styles.contentArea}>
            {/* Type selector - always visible in content tab */}
            {activeTab === 'content' && (
              <TouchableOpacity 
                style={styles.typeSelector}
                onPress={() => setTypeSelectVisible(true)}
              >
                <Text style={styles.typeSelectorIcon}>{TYPE_ICONS[qrData.type]}</Text>
                <Text style={styles.typeSelectorText}>{getQRTypeDisplayName(qrData.type)}</Text>
                <Ionicons name="chevron-down" size={16} color="#10b981" />
              </TouchableOpacity>
            )}

            {/* Always render form content for content tab, designer for design tab */}
            {activeTab === 'content' ? (
              renderFormContent()
            ) : (
              <QRCodeDesigner 
                data={qrData.value || 'https://example.com'}
                isPremium={isPremium}
                onStyleChange={handleStyleChange}
              />
            )}
          </View>

          {/* Save button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.saveButtonContent}>
                <Ionicons name="save-outline" size={20} color="white" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Save QR Code</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* QR Type selector */}
          <QRTypeSelector
            isVisible={typeSelectVisible}
            onClose={() => setTypeSelectVisible(false)}
            onSelect={handleTypeSelect}
            currentType={qrData.type}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 15,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  previewArea: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 20,
    alignItems: 'center',
  },
  scanMeContainer: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  scanMeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qrContainer: {
    width: 240,
    height: 240,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyQR: {
    width: 220,
    height: 220,
    backgroundColor: '#EEEEEE',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#F5F5F7',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeTabCircle: {
    backgroundColor: '#10b981',
  },
  tabNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#10b981',
  },
  contentArea: {
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F7EE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  typeSelectorIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#10b981',
  },
  typeSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#10b981',
  },
  formContent: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 8,
    color: '#000000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#10b981',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default CreateQRModal;