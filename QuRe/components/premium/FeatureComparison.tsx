import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PremiumFeature } from '@/utils/PremiumUtils';

interface FeatureComparisonProps {
  features: PremiumFeature[];
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ features }) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  
  // Animation values for staggered animation
  const fadeAnimations = useRef(features.map(() => new Animated.Value(0))).current;
  
  // Run animation when component mounts
  useEffect(() => {
    // Staggered animation for feature rows
    const animations = fadeAnimations.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 100 + index * 100, // Stagger the animations
        useNativeDriver: true,
      });
    });
    
    Animated.parallel(animations).start();
  }, []);
  
  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { flex: 2, color: textColor }]}>Features</Text>
        <Text style={[styles.headerText, { flex: 1, color: textColor }]}>Free</Text>
        <Text style={[styles.headerText, { flex: 1, color: tintColor }]}>Pro</Text>
      </View>
      
      {/* Feature Rows */}
      {features.map((feature, index) => (
        <Animated.View
          key={feature.id}
          style={[
            styles.featureRow,
            { borderTopColor: borderColor, opacity: fadeAnimations[index] },
          ]}
        >
          {/* Feature Name and Icon */}
          <View style={[styles.featureColumn, { flex: 2 }]}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: textColor }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDescription, { color: textColor }]}>
                {feature.description}
              </Text>
            </View>
          </View>
          
          {/* Free Version */}
          <View style={[styles.featureColumn, { flex: 1, alignItems: 'center' }]}>
            {typeof feature.free === 'boolean' ? (
              feature.free ? (
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              )
            ) : (
              <Text style={[styles.featureValue, { color: textColor }]}>{feature.free}</Text>
            )}
          </View>
          
          {/* Premium Version */}
          <View style={[styles.featureColumn, { flex: 1, alignItems: 'center' }]}>
            {typeof feature.premium === 'boolean' ? (
              feature.premium ? (
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              )
            ) : (
              <Text style={[styles.featureValue, { color: tintColor, fontWeight: '600' }]}>
                {feature.premium}
              </Text>
            )}
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 15,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  featureColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  featureDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  featureValue: {
    fontSize: 14,
  },
});

export default FeatureComparison;