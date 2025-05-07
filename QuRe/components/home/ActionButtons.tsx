import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonsProps {
  onExport: () => void;
  onSettings: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onExport, onSettings }) => {
  return (
    <View style={styles.notificationArea}>
      <TouchableOpacity 
        style={styles.notification} 
        activeOpacity={0.8}
        onPress={onExport}
      >
        <View style={styles.notificationIcon}>
          <Ionicons name="arrow-down-outline" size={20} color="#fff" />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>Export Wallpaper</Text>
          <Text style={styles.notificationText}>Save to your photos</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.notification} 
        activeOpacity={0.8}
        onPress={onSettings}
      >
        <View style={styles.notificationIcon}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>Settings</Text>
          <Text style={styles.notificationText}>Backgrounds & Plan Status</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationArea: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
    paddingHorizontal: 20,
  },
  notification: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    width: '90%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  notificationIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginBottom: 3,
  },
  notificationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default ActionButtons;