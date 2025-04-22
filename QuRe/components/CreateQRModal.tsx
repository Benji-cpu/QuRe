import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import QRCode from 'react-native-qrcode-svg';

interface CreateQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (newValue: string) => void;
  initialValue: string;
}

const CreateQRModal: React.FC<CreateQRModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValue,
}) => {
  const [qrValue, setQrValue] = useState(initialValue);
  const inputBgColor = useThemeColor({ light: '#f0f0f0', dark: '#333' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({ light: '#ccc', dark: '#555' }, 'icon');
  const subtleTextColor = useThemeColor({ light: '#999', dark: '#777' }, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const modalBg = useThemeColor({}, 'background');
  const overlayBg = useThemeColor({ light: 'rgba(0,0,0,0.6)', dark: 'rgba(0,0,0,0.8)' }, 'background');

  useEffect(() => {
    setQrValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(qrValue);
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
          <ThemedText style={styles.title}>Create/Edit QR Code</ThemedText>

          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: inputBgColor, 
                color: inputTextColor, 
                borderColor: inputBorderColor 
              }
            ]}
            value={qrValue}
            onChangeText={setQrValue}
            placeholder="Enter URL or text for QR code"
            placeholderTextColor={subtleTextColor}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={[styles.previewContainer, { borderColor: inputBorderColor }]}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={150}
              />
            ) : (
              <ThemedText style={[styles.previewPlaceholder, { color: subtleTextColor }]}>
                Preview appears here
              </ThemedText>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.cancelButton, { borderColor: inputBorderColor }]} onPress={onClose}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: tintColor }]} 
              onPress={handleSave}
              disabled={!qrValue}
            >
              <Text style={styles.saveButtonText}>Save</Text>
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
    width: '90%',
    maxWidth: 400,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  previewContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 5,
  },
  previewPlaceholder: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CreateQRModal; 