import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ExpandableSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  testID?: string;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon,
  children,
  initiallyExpanded = false,
  testID,
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const toggleExpanded = () => {
    // Configure the animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          borderColor,
          backgroundColor: bgColor
        }
      ]} 
      testID={testID}
    >
      <TouchableOpacity
        style={[styles.header]}
        onPress={toggleExpanded}
        testID={`${testID}-header`}
      >
        <View style={styles.titleContainer}>
          {icon && (
            <Text style={[styles.icon, { color: tintColor }]}>{icon}</Text>
          )}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={textColor}
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  content: {
    padding: 15,
    paddingTop: 5,
  },
});

export default ExpandableSection;