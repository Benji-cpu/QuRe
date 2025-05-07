import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolate, withDelay } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: "Welcome to QuRe!",
    description: "Create beautiful, custom QR codes directly on your phone.",
    icon: 'qr-code-outline',
  },
  {
    title: "Style Your Code",
    description: "Customize colors, add gradients, and even embed your logo.",
    icon: 'color-palette-outline',
  },
  {
    title: "Add to Home Screen",
    description: "Easily save your QR codes and add them as widgets for quick access.",
    icon: 'add-circle-outline',
  }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onClose }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inactiveDotColor = useThemeColor({ light: '#dcdcdc', dark: '#555' }, 'icon');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const modalVisible = useSharedValue(0); // 0 = hidden, 1 = visible
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalVisible.value,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    };
  });

  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0); // Reset to first step when modal opens
      modalVisible.value = withTiming(1, { duration: 200 });
      contentOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
      contentTranslateY.value = withDelay(100, withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }));
    } else {
      modalVisible.value = withTiming(0, { duration: 250 });
      contentOpacity.value = withTiming(0, { duration: 150 });
      contentTranslateY.value = withTiming(20, { duration: 150 });
    }
  }, [visible, modalVisible, contentOpacity, contentTranslateY]);

  const handleNext = () => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose(); // Close on last step
    }
  };

  const currentStep = onboardingSteps[currentStepIndex];

  return (
    <Modal
      animationType="none" // Use reanimated for animation
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, modalAnimatedStyle]}>
        <Animated.View style={[styles.modalView, { backgroundColor }, contentAnimatedStyle]}>
          <View style={styles.contentArea}>
            {currentStep.icon && (
               <Ionicons 
                 name={currentStep.icon as keyof typeof Ionicons.glyphMap} 
                 size={60} 
                 color={tintColor} 
                 style={styles.stepIcon} 
               />
            )}
            <Text style={[styles.modalTitle, { color: textColor }]}>{currentStep.title}</Text>
            <Text style={[styles.modalText, { color: textColor }]}>{currentStep.description}</Text>
          </View>

          <View style={styles.footerArea}>
            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { backgroundColor: index === currentStepIndex ? tintColor : inactiveDotColor },
                  ]}
                />
              ))}
            </View>

            {/* Action Button */}
            <Pressable
              style={({ pressed }) => [styles.actionButton, { backgroundColor: tintColor, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleNext}
              testID="onboarding-next-button"
            >
              <Text style={styles.actionButtonText}>
                {currentStepIndex === onboardingSteps.length - 1 ? "Get Started!" : "Next"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalView: {
    width: screenWidth * 0.85, // Percentage of screen width
    maxWidth: 380, // Max width
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  contentArea: {
    padding: 30, // More padding
    alignItems: 'center',
    minHeight: 250, // Ensure minimum height for content
    justifyContent: 'center',
  },
  stepIcon: {
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22, // Larger title
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20, // Adjusted margin
    textAlign: 'center',
    fontSize: 16, // Slightly larger text
    lineHeight: 24, // Improved readability
    color: '#666', // Softer text color (will be overridden by theme)
  },
  footerArea: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 10,
    alignItems: 'center',
    borderTopWidth: 1, // Separator line
    borderTopColor: 'rgba(0,0,0,0.05)', // Light separator
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    height: 10, // Explicit height
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, // Pill shape
    width: '80%', // Make button wider
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingModal; 