import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

interface PremiumUpgradeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgrade: () => void; // Callback when upgrade button is pressed
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ isVisible, onClose, onUpgrade }) => {

  const tintColor = useThemeColor({}, 'tint');
  const overlayBg = useThemeColor({ light: 'rgba(0,0,0,0.6)', dark: 'rgba(0,0,0,0.8)' }, 'background');
  const subtleTextColor = useThemeColor({ light: '#666', dark: '#aaa' }, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#555' }, 'icon');

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
        <ThemedView style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={28} color={subtleTextColor} />
          </TouchableOpacity>
          
          <ThemedText style={styles.title}>Unlock Premium Features!</ThemedText>
          
          <ThemedText style={styles.benefitText}>
            ✨ Remove the QuRe QR code for a cleaner look.
          </ThemedText>
          <ThemedText style={styles.benefitText}>
            🎨 Access exclusive background gradients.
          </ThemedText>
          <ThemedText style={styles.benefitText}>
            🚀 More customization options coming soon!
          </ThemedText>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.maybeLaterButton, { borderColor: borderColor }]} onPress={onClose}>
              <ThemedText style={styles.maybeLaterButtonText}>Maybe Later</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: tintColor }]} onPress={onUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
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
    width: '85%',
    maxWidth: 350,
    borderRadius: 15,
    padding: 25,
    paddingTop: 45, // Extra padding for close button spacing
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitText: {
      fontSize: 16,
      marginBottom: 12,
      textAlign: 'left',
      width: '100%', // Ensure text aligns left
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 25, 
  },
  maybeLaterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    // borderColor set dynamically
  },
  maybeLaterButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  upgradeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', 
  },
});

export default PremiumUpgradeModal; 