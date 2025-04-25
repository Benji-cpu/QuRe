import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  colors: readonly string[] | undefined | null; 
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ colors }) => {
  // Validate the colors prop before passing to LinearGradient
  if (!Array.isArray(colors) || colors.length < 2) {
     console.warn('[GradientBackground] Received invalid or insufficient colors prop:', colors, '- Rendering null.');
     return null;
  }

  // After the check, we know it's an array with at least 2 elements.
  const validColors = colors as unknown as readonly [string, string, ...string[]];

  return (
    <LinearGradient
      colors={validColors}
      style={styles.gradient}
      start={{ x: 0.1, y: 0.1 }} // Creates an angled gradient
      end={{ x: 0.9, y: 0.9 }} // Angle direction from top-left to bottom-right
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject, // Make gradient fill the container
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0, 
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default GradientBackground;