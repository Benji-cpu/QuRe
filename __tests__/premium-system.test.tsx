import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumProvider, usePremium } from '../QuRe/context/PremiumContext';
import { QRCodeProvider } from '../QuRe/context/QRCodeContext';
import CreateQRModal from '../QuRe/components/CreateQRModal';
import PremiumUpgradeModal from '../QuRe/components/premium/PremiumUpgradeModal';
import QRCodeSection from '../QuRe/components/home/QRCodeSection';
import { PREMIUM_FEATURES_LIST } from '../QuRe/utils/PremiumUtils';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <PremiumProvider>
    <QRCodeProvider>
      {children}
    </QRCodeProvider>
  </PremiumProvider>
);

// Test component to access premium context
const PremiumTester = ({ onPremiumState }: { onPremiumState: (state: any) => void }) => {
  const premium = usePremium();
  React.useEffect(() => {
    onPremiumState(premium);
  }, [premium, onPremiumState]);
  return null;
};

describe('Premium System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Premium Status Tracking', () => {
    it('should load and persist premium status correctly', async () => {
      // Mock initial premium status
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_premium_status') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onPremiumState).toHaveBeenCalledWith(
          expect.objectContaining({ isPremium: true })
        );
      });

      // Verify status was loaded from storage
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('qure_premium_status');
    });

    it('should update premium status after purchase', async () => {
      const onPremiumState = jest.fn();

      const { rerender } = render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      // Get premium context
      const premium = onPremiumState.mock.calls[0][0];

      // Simulate purchase
      await act(async () => {
        await premium.upgradeToPremium();
      });

      // Verify premium status was updated and persisted
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('qure_premium_status', 'true');
      expect(onPremiumState).toHaveBeenCalledWith(
        expect.objectContaining({ isPremium: true })
      );
    });
  });

  describe('Free Tier Limitations', () => {
    it('should prevent creating more than one QR code for free users', async () => {
      // Mock a free user with one QR code
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_premium_status') return Promise.resolve('false');
        if (key === 'qure_app_qr_codes') return Promise.resolve(JSON.stringify({
          'existing-qr': {
            id: 'existing-qr',
            type: 'link',
            label: 'Existing QR',
            data: { url: 'https://example.com' },
          }
        }));
        return Promise.resolve(null);
      });

      const onClose = jest.fn();
      const onSave = jest.fn();

      const { getByText } = render(
        <TestWrapper>
          <CreateQRModal
            isVisible={true}
            onClose={onClose}
            onSave={onSave}
            initialValue={{ type: 'link', value: 'https://' }}
          />
        </TestWrapper>
      );

      // Try to save a new QR code
      const saveButton = getByText('Save QR Code');
      fireEvent.press(saveButton);

      // Verify save was prevented
      await waitFor(() => {
        expect(onSave).not.toHaveBeenCalled();
      });
    });

    it('should require QuRe branding for free users', async () => {
      // Mock a free user
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_premium_status') return Promise.resolve('false');
        return Promise.resolve(null);
      });

      const onCustomQRPress = jest.fn();
      const onQureQRPress = jest.fn();

      const { getByTestId } = render(
        <TestWrapper>
          <QRCodeSection
            customQRData="https://example.com"
            qureQRData="https://qure.app/download"
            customQRStyleOptions={{}}
            onCustomQRPress={onCustomQRPress}
            onQureQRPress={onQureQRPress}
            isPremiumUser={false}
          />
        </TestWrapper>
      );

      // Verify QuRe branding QR code is present
      expect(getByTestId('qure-qr-code')).toBeTruthy();
    });
  });

  describe('Premium Offer Triggers', () => {
    it('should show premium offer when adding second QR code', async () => {
      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      const premium = onPremiumState.mock.calls[0][0];
      expect(premium.shouldShowOffer('qr-add')).toBe(true);
    });

    it('should show premium offer when trying to remove branding', async () => {
      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      const premium = onPremiumState.mock.calls[0][0];
      expect(premium.shouldShowOffer('branding-removal')).toBe(true);
    });

    it('should show premium offer after 3+ sessions', async () => {
      // Mock 3 sessions
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_session_count') return Promise.resolve('3');
        return Promise.resolve(null);
      });

      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      await waitFor(() => {
        const premium = onPremiumState.mock.calls[0][0];
        expect(premium.shouldShowOffer('session')).toBe(true);
      });
    });
  });

  describe('Dynamic Pricing System', () => {
    it('should decrease price after rejections', async () => {
      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      const premium = onPremiumState.mock.calls[0][0];
      const initialPrice = premium.getCurrentPrice().price;

      // Track rejection
      act(() => {
        premium.trackOfferRejection();
      });

      // Get new price
      const discountedPrice = premium.getCurrentPrice().price;
      expect(discountedPrice).toBeLessThan(initialPrice);
    });

    it('should not decrease price beyond maximum discount', async () => {
      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      const premium = onPremiumState.mock.calls[0][0];

      // Track multiple rejections
      act(() => {
        premium.trackOfferRejection();
        premium.trackOfferRejection();
        premium.trackOfferRejection(); // Should not affect price anymore
      });

      const finalPrice = premium.getCurrentPrice().price;
      expect(premium.rejectionCount).toBeLessThanOrEqual(2);
      expect(finalPrice).toBeGreaterThan(0);
    });
  });

  describe('Purchase Flow', () => {
    it('should handle successful purchase', async () => {
      const onUpgrade = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <PremiumUpgradeModal
            isVisible={true}
            onClose={() => {}}
            onUpgrade={onUpgrade}
          />
        </TestWrapper>
      );

      // Trigger purchase
      const purchaseButton = getByText(/upgrade now/i);
      fireEvent.press(purchaseButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('qure_premium_status', 'true');
        expect(onUpgrade).toHaveBeenCalled();
      });
    });

    it('should handle purchase restoration', async () => {
      // Mock existing purchase
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_premium_status') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      const premium = onPremiumState.mock.calls[0][0];

      await act(async () => {
        await premium.restorePurchases();
      });

      expect(onPremiumState).toHaveBeenCalledWith(
        expect.objectContaining({ isPremium: true })
      );
    });
  });

  describe('Session Counting', () => {
    it('should increment session count on app start', async () => {
      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('qure_session_count', '1');
      });
    });

    it('should persist session count between app starts', async () => {
      // Mock existing session count
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_session_count') return Promise.resolve('5');
        return Promise.resolve(null);
      });

      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('qure_session_count', '6');
      });
    });
  });

  describe('Offer Cooldown', () => {
    it('should respect cooldown period for non-critical offers', async () => {
      // Mock recent offer timestamp (less than 24 hours ago)
      const recentTimestamp = Date.now() - (12 * 60 * 60 * 1000); // 12 hours ago
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_last_offer_timestamp') return Promise.resolve(recentTimestamp.toString());
        return Promise.resolve(null);
      });

      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      await waitFor(() => {
        const premium = onPremiumState.mock.calls[0][0];
        // Should not show offer for non-critical triggers during cooldown
        expect(premium.shouldShowOffer('session')).toBe(false);
        expect(premium.shouldShowOffer('generation')).toBe(false);
        // Should still show offer for critical triggers
        expect(premium.shouldShowOffer('qr-add')).toBe(true);
        expect(premium.shouldShowOffer('branding-removal')).toBe(true);
      });
    });

    it('should allow offers after cooldown period', async () => {
      // Mock old offer timestamp (more than 24 hours ago)
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_last_offer_timestamp') return Promise.resolve(oldTimestamp.toString());
        if (key === 'qure_session_count') return Promise.resolve('3');
        return Promise.resolve(null);
      });

      const onPremiumState = jest.fn();

      render(
        <TestWrapper>
          <PremiumTester onPremiumState={onPremiumState} />
        </TestWrapper>
      );

      await waitFor(() => {
        const premium = onPremiumState.mock.calls[0][0];
        // Should show offers for all triggers after cooldown
        expect(premium.shouldShowOffer('session')).toBe(true);
        expect(premium.shouldShowOffer('generation')).toBe(true);
        expect(premium.shouldShowOffer('qr-add')).toBe(true);
        expect(premium.shouldShowOffer('branding-removal')).toBe(true);
      });
    });
  });
}); 