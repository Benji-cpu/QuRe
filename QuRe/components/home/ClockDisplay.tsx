import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface ClockDisplayProps {
  time: string;
  date: string;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({ time, date }) => {
  return (
    <View style={styles.timeDateContainer}>
      <Text style={styles.timeText}>{time}</Text>
      <Text style={styles.dateText}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timeDateContainer: {
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  timeText: {
    fontSize: 70,
    fontWeight: '200',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default ClockDisplay;