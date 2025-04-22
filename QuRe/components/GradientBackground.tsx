import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  colors: readonly [string, string, ...string[]]; // Ensure at least two colors
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ colors }) => {
  return (
    <LinearGradient
      colors={colors}
      style={styles.gradient}
      // Optional: Adjust start/end points for direction
      // start={{ x: 0, y: 0 }}
      // end={{ x: 1, y: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject, // Make gradient fill the container
  },
});

export default GradientBackground; 