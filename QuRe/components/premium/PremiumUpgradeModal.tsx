import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/useThemeColor';
import { usePremium } from '@/context/PremiumContext';
import { usePurchase } from '@/hooks/usePurchase';
import { PREMIUM_FEATURES_LIST } from '@/utils/PremiumUtils';

import FeatureComparison from './FeatureComparison';
import PricingDisplay from './PricingDisplay';
import PurchaseButton from './PurchaseButton';
import RestorePurchaseButton from './RestorePurchaseButton';

interface PremiumUpgradeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  trigger?: 'qr-add' | 'branding-removal' | 'session' | 'generation';
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isVisible,
  onClose,
  onUpgrade,
  trigger = 'session',
}) => {
  const { trackOfferRejection, getCurrentPrice } = usePremium();
  const { isPurchasing, initiatePurchase, restorePurchases } = usePurchase();
  
  // Get current price based on rejection count
  const priceInfo = getCurrentPrice();
  
  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  // Track offer view
  useEffect(() => {
    if (isVisible) {
      // Track that this offer was shown
      // In a real app, you might send analytics here
    }
  }, [isVisible]);
  
  // Handle purchase
  const handlePurchase = async () => {
    await initiatePurchase({
      onSuccess: () => {
        onUpgrade();
      },
    });
  };
  
  // Handle decline
  const handleDecline = () => {
    trackOfferRejection();
    onClose();
  };
  
  // Handle restore purchases
  const handleRestore = async () => {
    await restorePurchases();
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleDecline}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor }]}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: textColor }]}>
                Upgrade to QuRe Pro
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleDecline}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            
            {/* Content Scroll Area */}
            <ScrollView style={styles.scrollView}>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <View style={styles.appLogoContainer}>
                  <Text style={styles.appLogo}>QuRe</Text>
                  <View style={[styles.proBadge, { backgroundColor: tintColor }]}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={[styles.heroTitle, { color: textColor }]}>
                  Unlock the full QuRe experience
                </Text>
                <Text style={[styles.heroSubtitle, { color: textColor }]}>
                  Remove the QuRe branding, add unlimited QR codes, and access premium designs
                </Text>
              </View>
              
              {/* Feature Comparison */}
              <FeatureComparison features={PREMIUM_FEATURES_LIST} />
              
              {/* Pricing Display */}
              <PricingDisplay
                originalPrice={4.99}
                currentPrice={priceInfo.price}
                discount={priceInfo.discount}
                label={priceInfo.label}
              />
              
              {/* Guarantee Text */}
              <Text style={[styles.guaranteeText, { color: textColor }]}>
                One-time payment • No subscription • Lifetime access
              </Text>
            </ScrollView>
            
            {/* Bottom Action Buttons */}
            <View style={styles.actionButtons}>
              <PurchaseButton
                price={priceInfo.price}
                isLoading={isPurchasing}
                onPress={handlePurchase}
              />
              
              <RestorePurchaseButton
                onPress={handleRestore}
                isLoading={isPurchasing}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
  },
  appLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appLogo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  proBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  guaranteeText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  actionButtons: {
    padding: 20,
    alignItems: 'center',
  },
});

export default PremiumUpgradeModal;