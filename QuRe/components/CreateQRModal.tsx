import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { QRCodePreview } from '@/components/qr-base';

import LinkForm from './qr-types/LinkForm';
import EmailForm from './qr-types/EmailForm';
import CallForm from './qr-types/CallForm';
import SMSForm from './qr-types/SMSForm';
import VCardForm from './qr-types/VCardForm';
import WhatsAppForm from './qr-types/WhatsAppForm';
import TextForm from './qr-types/TextForm';

import QRTypeSelector from './QRTypeSelector';
import QRCodeDesigner from './qr-styling/QRCodeDesigner';

import { useQRCode } from '@/context/QRCodeContext';
import { QRType, QRCodeItem } from '@/context/QRCodeTypes';
import { parseQRCodeValue } from '@/context/QRCodeUtils';

import { HistoryPanel, LabelInput } from './qr-history';

export interface QRData {
  type: QRType;
  value: string;
  label?: string;
  styleOptions?: any;
}

interface CreateQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (qrData: QRData) => void;
  initialValue?: QRData;
  isPremium?: boolean;
}

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
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [qrType, setQrType] = useState<QRType>('link');
  const [qrValue, setQrValue] = useState<string>('https://');
  const [qrLabel, setQrLabel] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>({});
  const [styleOptions, setStyleOptions] = useState<any>({
    color: '#000000',
    backgroundColor: '#FFFFFF',
    enableLinearGradient: false,
    quietZone: 10,
    ecl: 'M'
  });
  const [typeSelectVisible, setTypeSelectVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (activeTab === 'content' && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [activeTab]);

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

  const handleTypeSelect = (type: QRType) => {
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
    setQrLabel('');
  };

  const handleFormDataChange = (value: string) => {
    setQrValue(value);
    const parsed = parseQRCodeValue(qrType, value);
    setParsedData(parsed);
  };

  const handleStyleChange = useCallback((options: any) => {
    setStyleOptions(options);
  }, []);

  const handleSelectFromHistory = (qrCode: QRCodeItem) => {
    setQrType(qrCode.type);
    setQrValue(getQRCodeValue(qrCode));
    setQrLabel(qrCode.label);
    setStyleOptions(qrCode.styleOptions);
    setParsedData(qrCode.data);
  };

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

  const handleSave = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onSave({
        type: qrType,
        value: qrValue,
        label: qrLabel || getQRTypeDisplayName(qrType),
        styleOptions
      });
      setIsGenerating(false);
    }, 500);
  };

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

  const renderFormContent = () => {
    return (
      <>
        <LabelInput
          value={qrLabel}
          onChange={setQrLabel}
          placeholder={`Enter label for ${getQRTypeDisplayName(qrType)} QR Code`}
        />
        
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
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.modalContainer}>
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

          <View style={styles.qrPreviewContainer}>
            <QRCodePreview 
              value={qrValue}
              size={160}
              showLabel={!!qrLabel}
              labelText={qrLabel}
              isGenerating={isGenerating}
              styleOptions={styleOptions}
            />
          </View>

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

          <ScrollView 
            ref={scrollViewRef}
            style={styles.contentScrollArea}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            removeClippedSubviews={false}
          >
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

            {activeTab === 'content' ? (
              renderFormContent()
            ) : (
              <QRCodeDesigner 
                data={qrValue || 'https://example.com'}
                isPremium={isPremium}
                onStyleChange={handleStyleChange}
              />
            )}
          </ScrollView>

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

          <QRTypeSelector
            isVisible={typeSelectVisible}
            onClose={() => setTypeSelectVisible(false)}
            onSelect={handleTypeSelect}
            currentType={qrType}
          />
          
          <HistoryPanel
            isVisible={historyVisible}
            onClose={() => setHistoryVisible(false)}
            onSelectQRCode={handleSelectFromHistory}
          />
        </View>
      </KeyboardAvoidingView>
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
  qrPreviewContainer: {
    height: 260,
    marginVertical: 5,
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
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
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