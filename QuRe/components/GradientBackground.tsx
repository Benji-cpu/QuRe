import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  // Prop type remains flexible for initial input
  colors: readonly string[] | undefined | null; 
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ colors }) => {
  // Validate the colors prop before passing to LinearGradient
  if (!Array.isArray(colors) || colors.length < 2) {
     console.warn('[GradientBackground] Received invalid or insufficient colors prop:', colors, '- Rendering null.');
     return null; // Render nothing if colors are invalid
  }

  // After the check, we know it's an array with at least 2 elements.
  // Assert via unknown to satisfy the linter and LinearGradient's type.
  const validColors = colors as unknown as readonly [string, string, ...string[]];

  return (
    <LinearGradient
      colors={validColors} // Use the asserted type
      style={styles.gradient}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject, // Make gradient fill the container
  },
});

export default GradientBackground; 