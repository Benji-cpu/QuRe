import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface StatusBarInfoProps {
  networkText?: string;
  batteryText?: string;
}

const StatusBarInfo: React.FC<StatusBarInfoProps> = ({ 
  networkText = '📶 12:30', 
  batteryText = '🔋 92%' 
}) => {
  return (
    <View style={styles.statusBar}>
      <View style={styles.statusLeft}>
        <Text style={styles.statusText}>{networkText}</Text>
      </View>
      <View style={styles.statusRight}>
        <Text style={styles.statusText}>{batteryText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 12,
    zIndex: 50,
  },
  statusLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StatusBarInfo;