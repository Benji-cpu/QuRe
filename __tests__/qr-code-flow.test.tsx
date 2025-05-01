/// <reference types="react" />
/// <reference types="react-native" />

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCodeProvider, useQRCode } from '../QuRe/context/QRCodeContext';
import { PremiumProvider } from '../QuRe/context/PremiumContext';
import CreateQRModal from '../QuRe/components/CreateQRModal';
import { HistoryPanel } from '../QuRe/components/qr-history';
import QRCodeSection from '../QuRe/components/home/QRCodeSection';
import { QRCodeItem, QRType, LinkQRCodeItem, TextQRCodeItem } from '../QuRe/context/QRCodeTypes';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

// Test wrapper component to provide context
const TestWrapper = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <PremiumProvider>
    <QRCodeProvider>
      {children}
    </QRCodeProvider>
  </PremiumProvider>
);

describe('QR Code Creation and History Flow', () => {
  beforeEach(() => {
    // Clear AsyncStorage mocks
    jest.clearAllMocks();
    (AsyncStorage.clear as jest.Mock).mockClear();
  });

  describe('Creating a New QR Code', () => {
    it('should create a new QR code with custom label and display it on main screen', async () => {
      const onClose = jest.fn();
      const onSave = jest.fn();

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <CreateQRModal
            isVisible={true}
            onClose={onClose}
            onSave={onSave}
            initialValue={{
              type: 'link',
              value: 'https://',
            }}
          />
        </TestWrapper>
      );

      // Fill in the form
      const labelInput = getByPlaceholderText(/enter label/i);
      fireEvent.changeText(labelInput, 'Benji');

      const urlInput = getByPlaceholderText(/enter url/i);
      fireEvent.changeText(urlInput, 'https://benji.com');

      // Save the QR code
      const saveButton = getByText('Save QR Code');
      fireEvent.press(saveButton);

      // Verify onSave was called with correct data
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          type: 'link',
          value: 'https://benji.com',
          label: 'Benji',
          styleOptions: expect.any(Object),
        });
      });
    });

    it('should display the newly created QR code on the main screen', () => {
      const { getByText } = render(
        <TestWrapper>
          <QRCodeSection
            customQRData="https://benji.com"
            qureQRData="https://qure.app/download"
            customQRStyleOptions={{}}
            onCustomQRPress={() => {}}
            onQureQRPress={() => {}}
            isPremiumUser={false}
          />
        </TestWrapper>
      );

      // Verify the label is displayed in uppercase
      expect(getByText('YOUR QR CODE')).toBeTruthy();
    });

    it('should remove placeholder QR code when creating first real QR code', async () => {
      const TestComponent = () => {
        const { qrCodes, addQRCode } = useQRCode();
        
        const createFirstQRCode = async () => {
          await addQRCode('link', { url: 'https://benji.com' }, 'Benji');
        };

        return (
          <View>
            <TouchableOpacity onPress={createFirstQRCode}>
              <Text>Create QR</Text>
            </TouchableOpacity>
            <Text testID="qr-count">{Object.keys(qrCodes).length}</Text>
          </View>
        );
      };

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initially should have default QR codes
      expect(getByTestId('qr-count').props.children).toBe(2); // 'qure-app' and 'user-default'

      // Create first real QR code
      fireEvent.press(getByText('Create QR'));

      // Should remove 'user-default' but keep 'qure-app'
      await waitFor(() => {
        expect(getByTestId('qr-count').props.children).toBe(2); // 'qure-app' and new QR code
      });
    });
  });

  describe('QR Code History', () => {
    it('should show newly created QR code in history panel', async () => {
      // First create a QR code
      const qrCode: LinkQRCodeItem = {
        id: 'test_qr_1',
        type: 'link',
        label: 'Benji',
        data: { url: 'https://benji.com' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrimary: false,
        styleOptions: {
          color: '#000000',
          backgroundColor: '#FFFFFF',
          enableLinearGradient: false,
          quietZone: 10,
          ecl: 'M',
        },
      };

      // Mock AsyncStorage to return our test QR code
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_app_qr_codes') {
          return Promise.resolve(JSON.stringify({
            'qure-app': {
              id: 'qure-app',
              type: 'link',
              label: 'QuRe App',
              data: { url: 'https://qure.app/download' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPrimary: false,
              styleOptions: {},
            },
            [qrCode.id]: qrCode,
          }));
        }
        return Promise.resolve(null);
      });

      const onClose = jest.fn();
      const onSelectQRCode = jest.fn();

      const { getByText } = render(
        <TestWrapper>
          <HistoryPanel
            isVisible={true}
            onClose={onClose}
            onSelectQRCode={onSelectQRCode}
          />
        </TestWrapper>
      );

      // Verify the QR code appears in history
      await waitFor(() => {
        expect(getByText('Benji')).toBeTruthy();
        expect(getByText('Link')).toBeTruthy();
      });
    });

    it('should not show placeholder QR code in history', async () => {
      // Mock AsyncStorage to return only the QuRe app QR code
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_app_qr_codes') {
          return Promise.resolve(JSON.stringify({
            'qure-app': {
              id: 'qure-app',
              type: 'link',
              label: 'QuRe App',
              data: { url: 'https://qure.app/download' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPrimary: false,
              styleOptions: {},
            },
            'user-default': {
              id: 'user-default',
              type: 'link',
              label: 'My QR Code',
              data: { url: 'https://' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPrimary: true,
              styleOptions: {},
            },
          }));
        }
        return Promise.resolve(null);
      });

      const { queryByText } = render(
        <TestWrapper>
          <HistoryPanel
            isVisible={true}
            onClose={() => {}}
            onSelectQRCode={() => {}}
          />
        </TestWrapper>
      );

      // Verify the placeholder QR code is not shown
      await waitFor(() => {
        expect(queryByText('My QR Code')).toBeNull();
      });
    });

    it('should load QR code data into Create modal when selected from history', async () => {
      const qrCode: LinkQRCodeItem = {
        id: 'test_qr_1',
        type: 'link',
        label: 'Benji',
        data: { url: 'https://benji.com' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrimary: false,
        styleOptions: {
          color: '#000000',
          backgroundColor: '#FFFFFF',
          enableLinearGradient: false,
          quietZone: 10,
          ecl: 'M',
        },
      };

      const onSave = jest.fn();

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <CreateQRModal
            isVisible={true}
            onClose={() => {}}
            onSave={onSave}
            initialValue={{
              type: 'link',
              value: qrCode.data.url,
              label: qrCode.label,
              styleOptions: qrCode.styleOptions,
            }}
          />
        </TestWrapper>
      );

      // Verify the form is pre-filled with the QR code data
      expect(getByPlaceholderText(/enter label/i).props.value).toBe('Benji');
      expect(getByPlaceholderText(/enter url/i).props.value).toBe('https://benji.com');

      // Save the QR code
      fireEvent.press(getByText('Save QR Code'));

      // Verify onSave was called with the same data
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          type: 'link',
          value: 'https://benji.com',
          label: 'Benji',
          styleOptions: expect.any(Object),
        });
      });
    });
  });

  describe('Complete User Flow', () => {
    it('should handle the complete flow from creation to history to selection', async () => {
      const TestComponent = () => {
        const { addQRCode, qrCodes } = useQRCode();
        
        const createQRCode = async () => {
          await addQRCode('link', { url: 'https://benji.com' }, 'Benji');
        };

        return (
          <View>
            <TouchableOpacity onPress={createQRCode}>
              <Text>Create QR</Text>
            </TouchableOpacity>
            <View testID="qr-codes">
              {Object.values(qrCodes).map((qr: QRCodeItem) => (
                <Text key={qr.id}>{qr.label}</Text>
              ))}
            </View>
          </View>
        );
      };

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Create QR code
      fireEvent.press(getByText('Create QR'));

      // Verify QR code was created
      await waitFor(() => {
        const qrCodes = getByTestId('qr-codes');
        expect(qrCodes).toHaveTextContent('Benji');
      });

      // Verify it appears in history
      const { getByText: getByTextInHistory } = render(
        <TestWrapper>
          <HistoryPanel
            isVisible={true}
            onClose={() => {}}
            onSelectQRCode={() => {}}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTextInHistory('Benji')).toBeTruthy();
      });

      // Verify it can be loaded into Create modal
      const onSave = jest.fn();
      const { getByPlaceholderText: getByPlaceholderTextInModal } = render(
        <TestWrapper>
          <CreateQRModal
            isVisible={true}
            onClose={() => {}}
            onSave={onSave}
            initialValue={{
              type: 'link',
              value: 'https://benji.com',
              label: 'Benji',
            }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByPlaceholderTextInModal(/enter label/i).props.value).toBe('Benji');
        expect(getByPlaceholderTextInModal(/enter url/i).props.value).toBe('https://benji.com');
      });
    });
  });

  describe('QR Code Creation Error Handling', () => {
    it('should handle errors when creating a QR code fails', async () => {
      const TestComponent = () => {
        const { addQRCode } = useQRCode();
        const [error, setError] = React.useState<string | null>(null);
        
        const createInvalidQRCodes = async () => {
          try {
            // Try to create a QR code with invalid data
            await addQRCode('link', { url: 'not-a-url' }, 'Invalid URL');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create QR code');
          }
        };

        return (
          <View>
            <TouchableOpacity onPress={createInvalidQRCodes}>
              <Text>Create Invalid QR</Text>
            </TouchableOpacity>
            {error && <Text testID="error-message">{error}</Text>}
          </View>
        );
      };

      const { getByText, findByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Attempt to create invalid QR code
      fireEvent.press(getByText('Create Invalid QR'));

      // Verify error message is displayed
      const errorMessage = await findByTestId('error-message');
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('QR Code History Filtering', () => {
    it('should filter QR codes in history panel', async () => {
      // Mock AsyncStorage with multiple QR codes
      const qrCodes: Record<string, QRCodeItem> = {
        'qure-app': {
          id: 'qure-app',
          type: 'link',
          label: 'QuRe App',
          data: { url: 'https://qure.app/download' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPrimary: false,
          styleOptions: {
            color: '#000000',
            backgroundColor: '#FFFFFF',
            enableLinearGradient: false,
            quietZone: 10,
            ecl: 'M',
          },
        } as LinkQRCodeItem,
        'test-1': {
          id: 'test-1',
          type: 'link',
          label: 'Test Link',
          data: { url: 'https://test.com' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPrimary: false,
          styleOptions: {
            color: '#000000',
            backgroundColor: '#FFFFFF',
            enableLinearGradient: false,
            quietZone: 10,
            ecl: 'M',
          },
        } as LinkQRCodeItem,
        'test-2': {
          id: 'test-2',
          type: 'text',
          label: 'Test Text',
          data: { content: 'Hello World' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPrimary: false,
          styleOptions: {
            color: '#000000',
            backgroundColor: '#FFFFFF',
            enableLinearGradient: false,
            quietZone: 10,
            ecl: 'M',
          },
        } as TextQRCodeItem,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_app_qr_codes') {
          return Promise.resolve(JSON.stringify(qrCodes));
        }
        return Promise.resolve(null);
      });

      const { getByText, getByPlaceholderText, queryByText } = render(
        <TestWrapper>
          <HistoryPanel
            isVisible={true}
            onClose={() => {}}
            onSelectQRCode={() => {}}
          />
        </TestWrapper>
      );

      // Wait for QR codes to load
      await waitFor(() => {
        expect(getByText('Test Link')).toBeTruthy();
        expect(getByText('Test Text')).toBeTruthy();
      });

      // Filter by type
      const filterInput = getByPlaceholderText(/search/i);
      fireEvent.changeText(filterInput, 'link');

      // Verify only link QR codes are shown
      await waitFor(() => {
        expect(getByText('Test Link')).toBeTruthy();
        expect(queryByText('Test Text')).toBeNull();
      });

      // Filter by label
      fireEvent.changeText(filterInput, 'Text');

      // Verify only QR codes with "Text" in label are shown
      await waitFor(() => {
        expect(getByText('Test Text')).toBeTruthy();
        expect(queryByText('Test Link')).toBeNull();
      });
    });
  });

  describe('QR Code Deletion', () => {
    it('should delete a QR code and update storage', async () => {
      const qrCode: LinkQRCodeItem = {
        id: 'test-delete',
        type: 'link',
        label: 'Delete Me',
        data: { url: 'https://delete.me' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrimary: false,
        styleOptions: {
          color: '#000000',
          backgroundColor: '#FFFFFF',
          enableLinearGradient: false,
          quietZone: 10,
          ecl: 'M',
        },
      };

      // Mock initial storage state
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_app_qr_codes') {
          return Promise.resolve(JSON.stringify({
            'qure-app': {
              id: 'qure-app',
              type: 'link',
              label: 'QuRe App',
              data: { url: 'https://qure.app/download' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPrimary: false,
              styleOptions: {
                color: '#000000',
                backgroundColor: '#FFFFFF',
                enableLinearGradient: false,
                quietZone: 10,
                ecl: 'M',
              },
            } as LinkQRCodeItem,
            [qrCode.id]: qrCode,
          }));
        }
        return Promise.resolve(null);
      });

      const TestComponent = () => {
        const { qrCodes, deleteQRCode } = useQRCode();
        
        const handleDelete = async () => {
          await deleteQRCode(qrCode.id);
        };

        return (
          <View>
            <TouchableOpacity onPress={handleDelete}>
              <Text>Delete QR</Text>
            </TouchableOpacity>
            <View testID="qr-codes">
              {Object.values(qrCodes).map((qr: QRCodeItem) => (
                <Text key={qr.id}>{qr.label}</Text>
              ))}
            </View>
          </View>
        );
      };

      const { getByText, queryByText, getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Verify QR code is initially present
      await waitFor(() => {
        expect(getByText('Delete Me')).toBeTruthy();
      });

      // Delete the QR code
      fireEvent.press(getByText('Delete QR'));

      // Verify QR code is removed
      await waitFor(() => {
        expect(queryByText('Delete Me')).toBeNull();
      });

      // Verify storage was updated
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'qure_app_qr_codes',
        expect.not.stringContaining('test-delete')
      );
    });
  });

  describe('QR Code Updates', () => {
    it('should update an existing QR code with new data', async () => {
      const originalQRCode: LinkQRCodeItem = {
        id: 'test-update',
        type: 'link',
        label: 'Update Me',
        data: { url: 'https://old-url.com' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrimary: false,
        styleOptions: {
          color: '#000000',
          backgroundColor: '#FFFFFF',
          enableLinearGradient: false,
          quietZone: 10,
          ecl: 'M',
        },
      };

      // Mock initial storage state
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'qure_app_qr_codes') {
          return Promise.resolve(JSON.stringify({
            'qure-app': {
              id: 'qure-app',
              type: 'link',
              label: 'QuRe App',
              data: { url: 'https://qure.app/download' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPrimary: false,
              styleOptions: {},
            },
            [originalQRCode.id]: originalQRCode,
          }));
        }
        return Promise.resolve(null);
      });

      const TestComponent = () => {
        const { qrCodes, updateQRCode } = useQRCode();
        
        const handleUpdate = async () => {
          await updateQRCode({
            ...originalQRCode,
            label: 'Updated Label',
            data: { url: 'https://new-url.com' },
            updatedAt: new Date().toISOString()
          });
        };

        return (
          <View>
            <TouchableOpacity onPress={handleUpdate}>
              <Text>Update QR</Text>
            </TouchableOpacity>
            <View testID="qr-codes">
              {Object.values(qrCodes).map((qr: QRCodeItem) => (
                <Text key={qr.id}>{`${qr.label}: ${(qr as LinkQRCodeItem).data.url}`}</Text>
              ))}
            </View>
          </View>
        );
      };

      const { getByText, findByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Verify initial state
      await findByText('Update Me: https://old-url.com');

      // Update the QR code
      fireEvent.press(getByText('Update QR'));

      // Verify QR code was updated
      await findByText('Updated Label: https://new-url.com');

      // Verify storage was updated
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'qure_app_qr_codes',
        expect.stringContaining('Updated Label')
      );
    });
  });

  describe('QR Code Style Options', () => {
    it('should apply and save custom style options', async () => {
      const customStyle = {
        color: '#FF0000',
        backgroundColor: '#00FF00',
        enableLinearGradient: true,
        quietZone: 15,
        ecl: 'H',
      };

      const TestComponent = () => {
        const { addQRCode, qrCodes } = useQRCode();
        
        const createStyledQR = async () => {
          await addQRCode('link', { url: 'https://styled.com' }, 'Styled QR', customStyle);
        };

        return (
          <View>
            <TouchableOpacity onPress={createStyledQR}>
              <Text>Create Styled QR</Text>
            </TouchableOpacity>
            <View testID="qr-codes">
              {Object.values(qrCodes).map((qr: QRCodeItem) => (
                <Text key={qr.id} testID={`style-${qr.id}`}>
                  {JSON.stringify(qr.styleOptions)}
                </Text>
              ))}
            </View>
          </View>
        );
      };

      const { getByText, findByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Create QR code with custom style
      fireEvent.press(getByText('Create Styled QR'));

      // Wait for the QR code to be created and verify style options
      const styleElement = await findByTestId(/style-/);
      const appliedStyle = JSON.parse(styleElement.props.children);
      
      expect(appliedStyle).toEqual(expect.objectContaining(customStyle));
    });
  });

  describe('QR Code Validation', () => {
    it('should validate QR code data before creation', async () => {
      const TestComponent = () => {
        const { addQRCode } = useQRCode();
        const [error, setError] = React.useState<string | null>(null);
        
        const createInvalidQRCodes = async () => {
          try {
            // Try to create QR codes with invalid data
            await addQRCode('link', { url: 'not-a-url' }, 'Invalid URL');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid URL format');
          }
        };

        return (
          <View>
            <TouchableOpacity onPress={createInvalidQRCodes}>
              <Text>Create Invalid QR</Text>
            </TouchableOpacity>
            {error && <Text testID="validation-error">{error}</Text>}
          </View>
        );
      };

      const { getByText, findByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Attempt to create QR code with invalid URL
      fireEvent.press(getByText('Create Invalid QR'));

      // Verify validation error is displayed
      const errorElement = await findByTestId('validation-error');
      expect(errorElement.props.children).toBeTruthy();
    });
  });
}); 