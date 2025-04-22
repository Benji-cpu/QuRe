import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

// Define tab types
type ActiveTab = 'background' | 'qrcodes';

interface EditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGradientSelect: (gradientKey: string) => void; // Callback for gradient selection
  onEditCustomQR: () => void; // Callback for editing custom QR
  onManageQureQR: () => void; // Callback for managing QuRe QR (premium/hide)
  currentGradientKey?: string; // Optional: To highlight selected gradient
}

const gradientEntries = Object.entries(Gradients);

const EditModal: React.FC<EditModalProps> = ({
  isVisible,
  onClose,
  onGradientSelect,
  onEditCustomQR,
  onManageQureQR,
  currentGradientKey,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('background');

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'icon');
  const inactiveTabColor = useThemeColor({ light: '#666', dark: '#999' }, 'text');
  const subtleTextColor = useThemeColor({ light: '#888', dark: '#aaa' }, 'text');
  const overlayBackground = useThemeColor({ light: 'rgba(0,0,0,0.5)', dark: 'rgba(0,0,0,0.7)' }, 'background');

  const renderContent = () => {
    if (activeTab === 'background') {
      return (
        <ScrollView contentContainerStyle={styles.gradientListContainer}>
          {gradientEntries.map(([key, colors]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.gradientPreviewButton,
                currentGradientKey === key && styles.gradientPreviewButtonSelected,
              ]}
              onPress={() => onGradientSelect(key)}
            >
              <LinearGradient colors={colors} style={styles.gradientPreview} />
              <ThemedText style={styles.gradientPreviewText}>{key}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    } else if (activeTab === 'qrcodes') {
      return (
        <View style={styles.qrTabContainer}> 
          <TouchableOpacity style={styles.qrOptionButton} onPress={onEditCustomQR}>
            <ThemedText style={styles.qrOptionText}>Edit Custom QR Code</ThemedText>
            {/* Add icon later? */}
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrOptionButton} onPress={onManageQureQR}>
            <ThemedText style={styles.qrOptionText}>Manage QuRe QR Code</ThemedText>
            <ThemedText style={styles.qrOptionSubText}>(Hide / Show - Premium)</ThemedText>
          </TouchableOpacity>
          {/* Add Premium upgrade prompt/button here later if needed */}
        </View>
      );
    }
    return null;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlayBackground }]}>
        <ThemedView style={styles.modalContent}> 
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color={inactiveTabColor} />
          </TouchableOpacity>

          <ThemedText style={styles.title}>Edit Screen</ThemedText>

          <View style={[styles.tabContainer, { borderBottomColor: borderColor }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'background' && [styles.tabButtonActive, { borderBottomColor: tintColor }],
              ]}
              onPress={() => setActiveTab('background')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: inactiveTabColor },
                  activeTab === 'background' && [styles.tabTextActive, { color: tintColor }],
                ]}
              >
                Background
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'qrcodes' && [styles.tabButtonActive, { borderBottomColor: tintColor }],
              ]}
              onPress={() => setActiveTab('qrcodes')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: inactiveTabColor },
                  activeTab === 'qrcodes' && [styles.tabTextActive, { color: tintColor }],
                ]}
              >
                QR Codes
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContentContainer}>
            {renderContent()}
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 0,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  tabContentContainer: {
    flex: 1,
    width: '100%',
  },
  gradientListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  gradientPreviewButton: {
    width: '45%',
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
    padding: 5,
  },
  gradientPreviewButtonSelected: {
    borderColor: '#0a7ea4',
  },
  gradientPreview: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
  },
  gradientPreviewText: {
    fontSize: 14,
  },
  qrTabContainer: {
    padding: 20,
  },
  qrOptionButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  qrOptionText: {
    fontSize: 16,
  },
  qrOptionSubText: {
      fontSize: 12,
      marginTop: 2,
  },
});

export default EditModal; 