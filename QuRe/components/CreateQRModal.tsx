import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { QRCodePreview } from '@/components/qr-base';

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

// Import QR code context and utils
import { useQRCode } from '@/context/QRCodeContext';
import { QRType, QRCodeItem } from '@/context/QRCodeTypes';
import { parseQRCodeValue } from '@/context/QRCodeUtils';

// Import history panel and label input
import { HistoryPanel, LabelInput } from './qr-history';

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
  const [qrType, setQrType] = useState<QRType>('link');
  const [qrValue, setQrValue] = useState<string>('https://');
  const [qrLabel, setQrLabel] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>({});
  
  // State for QR styling options
  const [styleOptions, setStyleOptions] = useState<any>({
    color: '#000000',
    backgroundColor: '#FFFFFF',
    enableLinearGradient: false,
    quietZone: 10,
    ecl: 'M'
  });
  
  // State for QR type selector visibility
  const [typeSelectVisible, setTypeSelectVisible] = useState(false);
  
  // State for history panel visibility
  const [historyVisible, setHistoryVisible] = useState(false);
  
  // State for loading state during QR generation
  const [isGenerating, setIsGenerating] = useState(false);

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Initialize form with initial value
  useEffect(() => {
    if (isVisible) {
      // If we have initialValue, use it
      if (initialValue) {
        setQrType(initialValue.type || 'link');
        setQrValue(initialValue.value || 'https://');
        setQrLabel(initialValue.label || '');
        setStyleOptions(initialValue.styleOptions || {
          color: '#000000',
          backgroundColor: '#FFFFFF',
          enableLinearGradient: false,
          quietZone: 10,
          ecl: 'M'
        });
        
        // Parse the initial value
        const parsed = parseQRCodeValue(initialValue.type || 'link', initialValue.value || 'https://');
        setParsedData(parsed);
        
        return;
      }
      
      // Default settings if no initialValue
      setQrType('link');
      setQrValue('https://');
      setQrLabel('');
      setStyleOptions({
        color: '#000000',
        backgroundColor: '#FFFFFF',
        enableLinearGradient: false,
        quietZone: 10,
        ecl: 'M'
      });
      setParsedData({ url: 'https://' });
    }
  }, [isVisible, initialValue]);

  // Generate a default label based on content
  useEffect(() => {
    if (!qrLabel && qrValue) {
      let defaultLabel = '';
      
      switch (qrType) {
        case 'link':
          try {
            const url = new URL(qrValue);
            defaultLabel = url.hostname;
          } catch {
            defaultLabel = 'Link';
          }
          break;
        case 'email':
          const emailMatch = qrValue.match(/mailto:([^?]+)/);
          defaultLabel = emailMatch ? `Email: ${emailMatch[1]}` : 'Email';
          break;
        case 'call':
          const phoneMatch = qrValue.match(/tel:(.+)/);
          defaultLabel = phoneMatch ? `Call: ${phoneMatch[1]}` : 'Call';
          break;
        case 'text':
          defaultLabel = qrValue.length > 20 
            ? `Text: ${qrValue.substring(0, 20)}...` 
            : `Text: ${qrValue}`;
          break;
        default:
          defaultLabel = `${qrType.charAt(0).toUpperCase() + qrType.slice(1)} QR Code`;
      }
      
      setQrLabel(defaultLabel);
    }
  }, [qrType, qrValue, qrLabel]);

  // Handle QR type selection
  const handleTypeSelect = (type: QRType) => {
    // Default values for each type
    const defaultValues: Record<QRType, string> = {
      link: 'https://',
      email: 'mailto:email@example.com',
      call: 'tel:+1234567890',
      sms: 'sms:+1234567890',
      vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:Example Name\nEND:VCARD',
      whatsapp: 'https://wa.me/1234567890',
      text: 'Hello World'
    };
    
    setQrType(type);
    setQrValue(defaultValues[type]);
    setParsedData(parseQRCodeValue(type, defaultValues[type]));
    setTypeSelectVisible(false);
    setQrLabel(''); // Reset label to trigger automatic generation
  };

  // Handle form data update
  const handleFormDataChange = (value: string) => {
    setQrValue(value);
    
    // Try to parse the value to update the form
    const parsed = parseQRCodeValue(qrType, value);
    setParsedData(parsed);
  };

  // Handle style options change
  const handleStyleChange = useCallback((options: any) => {
    setStyleOptions(options);
  }, []);

  // Handle selecting a QR code from history
  const handleSelectFromHistory = (qrCode: QRCodeItem) => {
    setQrType(qrCode.type);
    setQrValue(getQRCodeValue(qrCode));
    setQrLabel(qrCode.label);
    setStyleOptions(qrCode.styleOptions);
    setParsedData(qrCode.data);
  };

  // Convert QRCodeItem to value string
  const getQRCodeValue = (qrCode: QRCodeItem): string => {
    switch (qrCode.type) {
      case 'link':
        return qrCode.data.url;
      case 'email':
        let emailValue = `mailto:${qrCode.data.email}`;
        if (qrCode.data.subject || qrCode.data.body) {
          const params = [];
          if (qrCode.data.subject) params.push(`subject=${encodeURIComponent(qrCode.data.subject)}`);
          if (qrCode.data.body) params.push(`body=${encodeURIComponent(qrCode.data.body)}`);
          emailValue += `?${params.join('&')}`;
        }
        return emailValue;
      case 'call':
        return `tel:${qrCode.data.phoneNumber}`;
      case 'sms':
        let smsValue = `sms:${qrCode.data.phoneNumber}`;
        if (qrCode.data.message) {
          smsValue += `?body=${encodeURIComponent(qrCode.data.message)}`;
        }
        return smsValue;
      case 'whatsapp':
        let whatsappValue = `https://wa.me/${qrCode.data.phoneNumber}`;
        if (qrCode.data.message) {
          whatsappValue += `?text=${encodeURIComponent(qrCode.data.message)}`;
        }
        return whatsappValue;
      case 'vcard':
        // Generate vCard format
        const vcardLines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${qrCode.data.firstName} ${qrCode.data.lastName}`,
          `N:${qrCode.data.lastName};${qrCode.data.firstName};;;`,
        ];
        
        if (qrCode.data.phoneNumber) {
          vcardLines.push(`TEL;TYPE=WORK:${qrCode.data.phoneNumber}`);
        }
        
        if (qrCode.data.mobileNumber) {
          vcardLines.push(`TEL;TYPE=CELL:${qrCode.data.mobileNumber}`);
        }
        
        if (qrCode.data.email) {
          vcardLines.push(`EMAIL:${qrCode.data.email}`);
        }
        
        if (qrCode.data.website) {
          vcardLines.push(`URL:${qrCode.data.website}`);
        }
        
        vcardLines.push('END:VCARD');
        return vcardLines.join('\n');
      case 'text':
        return qrCode.data.content;
      default:
        return '';
    }
  };

  // Handle save button press
  const handleSave = () => {
    setIsGenerating(true);
    // Simulate generation process
    setTimeout(() => {
      onSave({
        type: qrType,
        value: qrValue,
        label: qrLabel,
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
    return (
      <>
        {/* Label Input - Always first */}
        <LabelInput
          value={qrLabel}
          onChange={setQrLabel}
          placeholder={`Enter label for ${getQRTypeDisplayName(qrType)} QR Code`}
        />
        
        {/* Type-specific form */}
        {qrType === 'link' && (
          <LinkForm value={qrValue} onChange={handleFormDataChange} />
        )}
        {qrType === 'email' && (
          <EmailForm value={qrValue} onChange={handleFormDataChange} />
        )}
        {qrType === 'call' && (
          <CallForm value={qrValue} onChange={handleFormDataChange} />
        )}
        {qrType === 'sms' && (
          <SMSForm value={qrValue} onChange={handleFormDataChange} />
        )}
        {qrType === 'vcard' && (
          <VCardForm value={qrValue} onChange={handleFormDataChange} />
        )}
        {qrType === 'whatsapp' && (
          <WhatsAppForm value={qrValue} onChange={handleFormDataChange} />
        )}
        {qrType === 'text' && (
          <TextForm value={qrValue} onChange={handleFormDataChange} />
        )}
      </>
    );
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
          {/* Header with history and close buttons */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create QR Code</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.historyButton} 
                onPress={() => setHistoryVisible(true)}
              >
                <Ionicons name="time-outline" size={24} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>

          {/* QR Preview using our new component */}
          <QRCodePreview 
            value={qrValue}
            size={160}
            showLabel={!!qrLabel}
            labelText={qrLabel}
            isGenerating={isGenerating}
            styleOptions={styleOptions}
          />

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
          <ScrollView style={styles.contentScrollArea}>
            <View style={styles.contentArea}>
              {/* Type selector - always visible in content tab */}
              {activeTab === 'content' && (
                <TouchableOpacity 
                  style={styles.typeSelector}
                  onPress={() => setTypeSelectVisible(true)}
                >
                  <Text style={styles.typeSelectorIcon}>{TYPE_ICONS[qrType] || '🔗'}</Text>
                  <Text style={styles.typeSelectorText}>{getQRTypeDisplayName(qrType) || 'Link'}</Text>
                  <Ionicons name="chevron-down" size={16} color="#10b981" />
                </TouchableOpacity>
              )}

              {/* Render tab-specific content */}
              {activeTab === 'content' ? (
                renderFormContent()
              ) : (
                // Design tab - QRCodeDesigner component
                <QRCodeDesigner 
                  data={qrValue || 'https://example.com'}
                  isPremium={isPremium}
                  onStyleChange={handleStyleChange}
                />
              )}
            </View>
          </ScrollView>

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
            currentType={qrType}
          />
          
          {/* History Panel */}
          <HistoryPanel
            isVisible={historyVisible}
            onClose={() => setHistoryVisible(false)}
            onSelectQRCode={handleSelectFromHistory}
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
    height: '90%',
    maxHeight: 700,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
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
  headerButtons: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyButton: {
    padding: 4,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
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
  contentScrollArea: {
    flex: 1,
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
  saveButton: {
    backgroundColor: '#10b981',
    margin: 16,
    marginTop: 8,
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