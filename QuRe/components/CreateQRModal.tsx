import React, { useState, useEffect, useCallback, useRef } from 'react';
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

import LinkForm from './qr-types/LinkForm';
import EmailForm from './qr-types/EmailForm';
import CallForm from './qr-types/CallForm';
import SMSForm from './qr-types/SMSForm';
import VCardForm from './qr-types/VCardForm';
import WhatsAppForm from './qr-types/WhatsAppForm';
import TextForm from './qr-types/TextForm';

import QRTypeSelector from './QRTypeSelector';
import QRCodeDesigner from './qr-styling/QRCodeDesigner';

export type QRType = 'link' | 'email' | 'call' | 'sms' | 'vcard' | 'whatsapp' | 'text';

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
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [qrData, setQrData] = useState<QRData>({ 
    type: 'link', 
    value: 'https://' 
  });
  
  const [styleOptions, setStyleOptions] = useState<any>(null);
  const [typeSelectVisible, setTypeSelectVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // Force re-render of preview

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (initialValue) {
      setQrData(initialValue);
      if (initialValue.styleOptions) {
        setStyleOptions(initialValue.styleOptions);
      }
    }
  }, [initialValue]);

  useEffect(() => {
    if (isVisible) {
      setQrData(current => ({ ...current }));
    }
  }, [isVisible]);

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
    
    setQrData({
      type,
      value: defaultValues[type],
      styleOptions
    });
    setTypeSelectVisible(false);
  };

  const handleFormDataChange = (value: string) => {
    setQrData(prev => ({
      ...prev,
      value
    }));
    // Force preview to update
    setPreviewKey(prev => prev + 1);
  };

  const handleStyleChange = useCallback((options: any) => {
    setStyleOptions(options);
    // Force preview to update
    setPreviewKey(prev => prev + 1);
  }, []);

  const handleSave = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onSave({
        ...qrData,
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
        return <LinkForm value={qrData.value || 'https://'} onChange={handleFormDataChange} />;
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create QR Code</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <QRCodePreview 
            key={`preview-${previewKey}`}
            value={qrData.value}
            size={160}
            showLabel={false}
            isGenerating={isGenerating}
            styleOptions={styleOptions}
          />

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

          <ScrollView style={styles.contentScrollArea}>
            <View style={styles.contentArea}>
              {activeTab === 'content' && (
                <TouchableOpacity 
                  style={styles.typeSelector}
                  onPress={() => setTypeSelectVisible(true)}
                >
                  <Text style={styles.typeSelectorIcon}>{TYPE_ICONS[qrData.type] || '🔗'}</Text>
                  <Text style={styles.typeSelectorText}>{getQRTypeDisplayName(qrData.type) || 'Link'}</Text>
                  <Ionicons name="chevron-down" size={16} color="#10b981" />
                </TouchableOpacity>
              )}

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
  closeButton: {
    position: 'absolute',
    right: 16,
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