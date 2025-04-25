import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const StatusBarInfo: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>QuRe</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default StatusBarInfo; 