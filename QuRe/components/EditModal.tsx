import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

// Import necessary hooks
import { usePremium } from '@/context/PremiumContext';
import { usePurchase } from '@/hooks/usePurchase';

// Define tab types
type ActiveTab = 'background' | 'plan';

interface EditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGradientSelect: (gradientKey: string) => void; // Callback for gradient selection
  currentGradientKey?: string; // Optional: To highlight selected gradient
}

const gradientEntries = Object.entries(Gradients);

const EditModal: React.FC<EditModalProps> = ({
  isVisible,
  onClose,
  onGradientSelect,
  currentGradientKey,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('background');

  // --- Hooks --- 
  const { isPremium } = usePremium();
  const { restorePurchases, isRestoring } = usePurchase(); // Assuming isRestoring exists

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
    } else if (activeTab === 'plan') {
      return (
        <View style={styles.planTabContainer}>
          <View style={styles.planStatusContainer}>
            <ThemedText style={styles.planStatusLabel}>Current Plan:</ThemedText>
            <ThemedText style={[styles.planStatusValue, { color: isPremium ? Colors.light.tint : textColor }]}>
              {isPremium ? '✨ Pro ✨' : 'Basic'}
            </ThemedText>
          </View>

          {isPremium ? (
            <ThemedText style={styles.planDescription}>
              You have unlocked all premium features! Enjoy the full QuRe experience.
            </ThemedText>
          ) : (
            <ThemedText style={styles.planDescription}>
              Upgrade to Pro to remove branding, add unlimited QR codes, and access premium designs.
            </ThemedText>
          )}

          <TouchableOpacity 
            style={[styles.restoreButton, { backgroundColor: tintColor }]} 
            onPress={() => restorePurchases()}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>
          <ThemedText style={styles.restoreSubText}>
            Already purchased? Tap here to restore your Pro access.
          </ThemedText>
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
                activeTab === 'plan' && [styles.tabButtonActive, { borderBottomColor: tintColor }],
              ]}
              onPress={() => setActiveTab('plan')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: inactiveTabColor },
                  activeTab === 'plan' && [styles.tabTextActive, { color: tintColor }],
                ]}
              >
                My Plan
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
  // --- Plan Tab Styles --- 
  planTabContainer: {
    flex: 1,
    padding: 25,
    alignItems: 'center',
  },
  planStatusContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
    backgroundColor: 'rgba(120, 120, 128, 0.1)', // Subtle background
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  planStatusLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  planStatusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 10, // Ensure text doesn't touch edges
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, 
    marginBottom: 8,
    minWidth: 180, // Give the button some width
    alignItems: 'center', // Center text/indicator
  },
  restoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreSubText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  // --- End Plan Tab Styles --- 
});

export default EditModal; 