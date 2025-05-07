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
  Platform,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

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

// Helper hook to track previous values
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export interface QRData {
  type: QRType;
  value: string;
  label?: string;
  styleOptions?: any;
  data?: any;
}

interface CreateQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (qrData: QRData) => void;
  initialValue?: QRData;
  isPremium?: boolean;
  onResetToCreate: () => void;
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

// Enhanced LabelInput component for better Android focus handling
export const EnhancedLabelInput: React.FC<{
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  const inputRef = useRef<TextInput>(null);
  
  // Fix for Android keyboard disappearing issue
  const handleFocus = () => {
    if (Platform.OS === 'android') {
      // Ensure we maintain focus on Android
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  return (
    <View style={styles.labelInputContainer}>
      <TextInput
        ref={inputRef}
        style={styles.labelInput}
        value={value}
        onChangeText={(text) => {
          console.log(`LabelInput onChangeText: "${text}"`);
          onChange(text);
        }}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        onFocus={handleFocus}
        // Prevent keyboard issues on Android
        autoComplete={Platform.OS === 'android' ? 'off' : undefined}
        textContentType="none"
        blurOnSubmit={false}
      />
    </View>
  );
};

const CreateQRModal: React.FC<CreateQRModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValue,
  isPremium = false,
  onResetToCreate,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const previousInitialValueRef = useRef<QRData | undefined>(initialValue);
  const isResettingRef = useRef(false); // Flag to prevent effect conflicts
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [qrType, setQrType] = useState<QRType>('link');
  const [qrValue, setQrValue] = useState<string>('https://');
  const [qrLabel, setQrLabel] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>({});
  const [styleOptions, setStyleOptions] = useState<any>({
    color: '#000000',
    backgroundColor: '#FFFFFF',
    enableLinearGradient: false,
    quietZone: 0,
    ecl: 'M'
  });
  const [typeSelectVisible, setTypeSelectVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // --- START: Previous State Tracking for Debugging --- //
  const prevQrType = usePrevious(qrType);
  const prevQrValue = usePrevious(qrValue);
  const prevQrLabel = usePrevious(qrLabel);
  const prevActiveTab = usePrevious(activeTab);
  const prevStyleOptions = usePrevious(styleOptions);
  const prevParsedData = usePrevious(parsedData);
  const prevIsVisible = usePrevious(isVisible);

  // Conditional logging moved here, after state and prev state are defined
  if (prevIsVisible !== undefined) { // Avoid logging on initial mount before prevIsVisible is set
    console.log('[CreateQRModal] Rendering/Re-rendering START');
    if (isVisible && prevIsVisible === false) {
      console.log('  Modal became visible.');
    }
    if (!isVisible && prevIsVisible === true) {
      console.log('  Modal became hidden.');
    }
    if (qrType !== prevQrType) {
      console.log(`  qrType changed: ${prevQrType} -> ${qrType}`);
    }
    if (qrValue !== prevQrValue) {
      console.log(`  qrValue changed: FROM "${prevQrValue}" TO "${qrValue}"`);
    }
    if (qrLabel !== prevQrLabel) {
      console.log(`  qrLabel changed: FROM "${prevQrLabel}" TO "${qrLabel}"`);
    }
    if (activeTab !== prevActiveTab) {
      console.log(`  activeTab changed: ${prevActiveTab} -> ${activeTab}`);
    }
    if (JSON.stringify(styleOptions) !== JSON.stringify(prevStyleOptions)) {
      console.log(`  styleOptions changed: FROM ${JSON.stringify(prevStyleOptions)} TO ${JSON.stringify(styleOptions)}`);
    }
    if (JSON.stringify(parsedData) !== JSON.stringify(prevParsedData)) {
      console.log(`  parsedData changed: FROM ${JSON.stringify(prevParsedData)} TO ${JSON.stringify(parsedData)}`);
    }
    console.log('[CreateQRModal] Rendering/Re-rendering END');
  } else {
    // Initial mount log
    console.log('[CreateQRModal] Initial component mount/render.');
  }
  // --- END: Previous State Tracking for Debugging --- //

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Animation state
  const scale = useSharedValue(0.9); // Initial scale
  const opacity = useSharedValue(0); // Initial opacity

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  // Trigger animation when modal visibility changes or input focus changes
  useEffect(() => {
    if (isVisible) {
      if (!isInputFocused) {
        // Full animation when not focused on inputs
        scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.exp) });
        opacity.value = withTiming(1, { duration: 200 });
      } else {
        // Simplified animation when keyboard is open to avoid interference
        scale.value = 1;
        opacity.value = 1;
      }
    } else {
      // Reset animation values when closing
      scale.value = 0.9;
      opacity.value = 0;
      // Reset tab state when modal closes
      setActiveTab('content'); 
      // Scroll back to top might be good UX when reopening
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isVisible, isInputFocused, scale, opacity]);

  // Fix for Android layout issues when showing/hiding keyboard
  useEffect(() => {
    if (Platform.OS === 'android' && isVisible) {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        console.log('[CreateQRModal] Keyboard did show');
        setIsInputFocused(true);
      });
      
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        console.log('[CreateQRModal] Keyboard did hide');
        setIsInputFocused(false);
      });
      
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
    return () => {};
  }, [isVisible]);

  useEffect(() => {
    console.log(
      `CreateQRModal useEffect: isVisible=${isVisible}, ` +
      `initialValueChanged=${initialValue !== previousInitialValueRef.current}, ` +
      `isResetting=${isResettingRef.current}`
    );

    // Only run initialization logic when modal becomes visible 
    // OR when a *different* defined initialValue is provided (switching edits)
    // Skip if the modal is already visible and initialValue just became undefined (handled by performReset)
    const shouldInitialize = 
      (isVisible && initialValue !== previousInitialValueRef.current && initialValue !== undefined) ||
      (isVisible && !previousInitialValueRef.current && initialValue !== undefined) || // Becoming visible with initial value
      (isVisible && !previousInitialValueRef.current && initialValue === undefined); // Becoming visible without initial value

    if (isVisible && shouldInitialize) {
      console.log('CreateQRModal: Running initialization logic.');
      if (initialValue && typeof initialValue.value === 'string' && initialValue.value.trim() !== '') {
        console.log(`CreateQRModal: Initializing in EDIT mode for type '${initialValue.type}'`);
        setQrType(initialValue.type);
        setQrValue(initialValue.value);
        setQrLabel(initialValue.label || '');
        setStyleOptions((prev: any) => ({
          color: '#000000',
          backgroundColor: '#FFFFFF',
          enableLinearGradient: false,
          quietZone: 0,
          ecl: 'M',
          ...(initialValue.styleOptions || {}),
        }));
        // Use structured data if available, otherwise parse the value
        if (initialValue.data) {
            console.log("CreateQRModal: Using initialValue.data for parsedData");
            setParsedData(initialValue.data);
        } else {
             console.log("CreateQRModal: Parsing initialValue.value for parsedData");
            try {
                setParsedData(parseQRCodeValue(initialValue.type, initialValue.value));
            } catch (parseError) {
                console.error(`Error parsing initial value for type ${initialValue.type}:`, parseError);
                setParsedData({});
            }
        }
        setActiveTab('content'); // Reset tab
      } else {
         console.log('CreateQRModal: Initializing/Resetting to CREATE mode defaults.');
        // Set defaults for CREATE mode
        setQrType('link');
        setQrValue('https://');
        setQrLabel('');
        setStyleOptions({
          color: '#000000',
          backgroundColor: '#FFFFFF',
          enableLinearGradient: false,
          quietZone: 0,
          ecl: 'M'
        });
        setParsedData({});
        setActiveTab('content'); // Reset tab
      }
      // Reset other modal states
      setTypeSelectVisible(false);
      setHistoryVisible(false);
      setIsGenerating(false);
      setIsInputFocused(false);

      // Scroll to top only when becoming visible
      if (!previousInitialValueRef.current) { // Simple check for initial mount
        setTimeout(() => { // Delay scroll slightly
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ y: 0, animated: false });
            }
        }, 0);
      }
    } else if (isVisible) {
       console.log('CreateQRModal useEffect: Skipping initialization logic.');
    }

    // Update previous value ref *after* comparison
    previousInitialValueRef.current = initialValue;

  }, [isVisible, initialValue]);

  useEffect(() => {
    if (isVisible && activeTab === 'content' && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [isVisible, activeTab]);

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
    const defaultLabel = generateDefaultLabel(type, defaultValues[type]);
    setQrLabel(defaultLabel);
  };

  const handleFormDataChange = (value: string) => {
    setQrValue(value);
    const parsed = parseQRCodeValue(qrType, value);
    setParsedData(parsed);
  };

  const handleLabelChange = (newLabel: string) => {
    console.log(`[CreateQRModal] LabelInput onChange trying to set label: "${newLabel}"`);
    setQrLabel(newLabel);
  };

  const handleStyleChange = useCallback((options: any) => {
    setStyleOptions(options);
  }, []);

  const handleSelectFromHistory = (qrCode: QRCodeItem) => {
    setQrType(qrCode.type);
    setQrValue(getQRCodeValue(qrCode));
    setQrLabel(qrCode.label);
    setStyleOptions(qrCode.styleOptions);
    setParsedData(qrCode.data || {});
    setHistoryVisible(false);
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
    console.log('[CreateQRModal] handleSave called'); // Log for save button
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

  // New form renderer with input focus handling
  const renderFormContent = () => {
    return (
      <>
        {/* Use enhanced label input */}
        <EnhancedLabelInput
          value={qrLabel}
          onChange={handleLabelChange}
          placeholder={`Enter label for ${getQRTypeDisplayName(qrType)} QR Code`}
        />
        
        {qrType === 'link' && (
          <LinkForm 
            value={qrValue} 
            onChange={handleFormDataChange}
          />
        )}
        {qrType === 'email' && (
          <EmailForm 
            value={qrValue} 
            onChange={handleFormDataChange}
          />
        )}
        {qrType === 'call' && (
          <CallForm 
            value={qrValue} 
            onChange={handleFormDataChange}
          />
        )}
        {qrType === 'sms' && (
          <SMSForm 
            value={qrValue} 
            onChange={handleFormDataChange}
          />
        )}
        {qrType === 'vcard' && (
          <VCardForm 
            value={qrValue} 
            onChange={handleFormDataChange}
          />
        )}
        {qrType === 'whatsapp' && (
          <WhatsAppForm 
            value={qrValue} 
            onChange={handleFormDataChange}
          />
        )}
        {qrType === 'text' && (
          <TextForm 
            value={qrValue} 
            onChange={handleFormDataChange}
          />
        )}
      </>
    );
  };

  // Explicit reset function within the modal
  const performReset = () => {
    console.log("[CreateQRModal] Performing explicit reset.");
    
    // Call the parent handler to clear editing state
    onResetToCreate(); 

    // Reset local state directly
    const defaultType = 'link';
    const defaultValue = 'https://';
    setQrType(defaultType);
    setQrValue(defaultValue);
    setQrLabel('');
    setStyleOptions({
      color: '#000000',
      backgroundColor: '#FFFFFF',
      enableLinearGradient: false,
      quietZone: 0,
      ecl: 'M'
    });
    setParsedData({});
    setActiveTab('content');
    setTypeSelectVisible(false);
    setHistoryVisible(false);
    setIsInputFocused(false);
    
    // Dismiss keyboard if open
    Keyboard.dismiss();
    
    // Scroll to top
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // *** ADD a helper function for default label generation ***
  const generateDefaultLabel = (type: QRType, value: string): string => {
    let label = '';
    switch (type) {
      case 'link':
        try {
          // Attempt to extract hostname, fallback to 'Link'
          const url = new URL(value.startsWith('http') ? value : `https://${value}`);
          label = url.hostname || 'Link';
        } catch {
          label = 'Link';
        }
        break;
      case 'email':
        const emailMatch = value.match(/mailto:([^?]+)/);
        label = emailMatch ? `Email: ${emailMatch[1]}` : 'Email';
        break;
      case 'call':
        const phoneMatch = value.match(/tel:(.+)/);
        label = phoneMatch ? `Call: ${phoneMatch[1]}` : 'Call';
        break;
      case 'sms':
        const smsMatch = value.match(/sms:([^?]+)/);
        label = smsMatch ? `SMS: ${smsMatch[1]}` : 'SMS';
        break;
      case 'whatsapp':
        const waMatch = value.match(/wa\.me\/([^?]+)/);
        label = waMatch ? `WhatsApp: ${waMatch[1]}` : 'WhatsApp';
        break;
      case 'text':
        label = value.length > 20 ? `Text: ${value.substring(0, 17)}...` : (value || 'Text');
        break;
      case 'vcard':
        // You might want a more sophisticated label for vCard, maybe based on FN?
        label = 'V-Card'; 
        break;
      default:
        // Ensure type safety with exhaustive check (optional)
        // const _exhaustiveCheck: never = type;
        // Handle potential unknown types gracefully
        label = `QR Code`; 
    }
    return label;
  };

  // Android-specific fixes for modal rendering
  const getAndroidModalProps = () => {
    if (Platform.OS === 'android') {
      return {
        hardwareAccelerated: true,
        statusBarTranslucent: true,
        onShow: () => {
          // Temporarily disable animations to fix focus issues
          const originalValue = LayoutAnimation.configureNext;
          LayoutAnimation.configureNext = () => {};
          
          setTimeout(() => {
            LayoutAnimation.configureNext = originalValue;
          }, 500);
        }
      };
    }
    return {};
  };

  return (
    <Modal
      animationType="fade" // Changed from "none" to "fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        console.log('[CreateQRModal] Modal onRequestClose triggered'); // Log for modal close
        onClose();
      }}
      {...getAndroidModalProps()}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Changed for Android
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View 
            style={styles.modalContainer}
            pointerEvents="box-none" // Allow touches to pass through to children
          >
            <Animated.View style={[styles.header, animatedStyle]}>
              <Text style={styles.headerTitle}>Create QR Code</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={performReset} // Use the explicit reset function
                >
                  <Ionicons name="add-circle-outline" size={26} color="#10b981" /> 
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setHistoryVisible(true)}
                >
                  <Ionicons name="time-outline" size={24} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity 
                   style={[styles.headerButton, styles.closeButtonInternal]}
                   onPress={() => {
                     console.log('[CreateQRModal] closeButtonInternal onPress triggered'); // Log for close button press
                     onClose();
                   }}
                >
                   <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </Animated.View>

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
                onPress={() => {
                  setActiveTab('content');
                  // Dismiss keyboard when switching tabs
                  Keyboard.dismiss();
                }}
              >
                <View style={[styles.tabCircle, activeTab === 'content' && styles.activeTabCircle]}>
                  <Text style={styles.tabNumber}>1</Text>
                </View>
                <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>Content</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'design' && styles.activeTab]}
                onPress={() => {
                  setActiveTab('design');
                  // Dismiss keyboard when switching tabs
                  Keyboard.dismiss();
                }}
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
              keyboardShouldPersistTaps="handled" // Changed from "always" to "handled"
              scrollEventThrottle={32} // Increased from 16
              removeClippedSubviews={false}
              keyboardDismissMode="none" // Added this property
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true} // Added for Android nested scroll handling
            >
              {activeTab === 'content' && (
                <TouchableOpacity 
                  style={styles.typeSelector}
                  onPress={() => {
                    console.log('[CreateQRModal] typeSelector onPress triggered'); // Log for type selector press
                    // Dismiss keyboard to prevent Android freezes
                    Keyboard.dismiss();
                    // Small delay to ensure keyboard is dismissed before showing type selector
                    setTimeout(() => {
                      setTypeSelectVisible(true);
                    }, 250);
                  }}
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
              onClose={() => {
                console.log('[CreateQRModal] QRTypeSelector onClose triggered'); // Log for QRTypeSelector close
                setTypeSelectVisible(false);
              }}
              onSelect={handleTypeSelect}
              currentType={qrType}
            />
            
            <HistoryPanel
              isVisible={historyVisible}
              onClose={() => {
                console.log('[CreateQRModal] HistoryPanel onClose triggered'); // Log for HistoryPanel close
                setHistoryVisible(false);
              }}
              onSelectQRCode={handleSelectFromHistory}
            />
          </View>
        </TouchableWithoutFeedback>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 15,
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 12,
  },
  closeButtonInternal: {
    // Specific style for close if needed, otherwise handled by headerButton
    // marginLeft: 12, 
  },
  qrPreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  // Added styles for the enhanced label input
  labelInputContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  labelInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  }
});

export default CreateQRModal;