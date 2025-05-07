import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCodeState, QRCodeItem, QRType, LinkQRCodeItem, EmailQRCodeItem, CallQRCodeItem, SMSQRCodeItem, VCardQRCodeItem, WhatsAppQRCodeItem, TextQRCodeItem } from './QRCodeTypes';
import { createQRCodeItem, qrCodeItemToValue, parseQRCodeValue } from './QRCodeUtils';
import { usePremium } from './PremiumContext';
import { Alert } from 'react-native';

const PREMIUM_REQUIRED_ERROR = 'Premium required to add more QR codes';
const PREMIUM_REQUIRED_BRANDING_ERROR = 'Premium required to remove branding';

const QR_CODES_STORAGE_KEY = 'qure_app_qr_codes';

interface QRCodeContextType extends QRCodeState {
  addQRCode: (type: QRType, data: any, label?: string, styleOptions?: any) => Promise<QRCodeItem>;
  updateQRCode: (qrCode: QRCodeItem) => Promise<void>;
  deleteQRCode: (id: string) => Promise<void>;
  getQRCodeValue: (id: string) => string;
  clearError: () => void;
  canAddQRCode: () => boolean;
  canRemoveBranding: () => boolean;
  showPremiumUpgrade: (reason: string) => void;
}

const initialQRCodeState: QRCodeState = {
  qrCodes: {
    'qure-app': {
      id: 'qure-app',
      type: 'link',
      label: 'QuRe App',
      data: {
        url: 'https://qure.app/download'
      },
      styleOptions: {
        color: '#000000',
        backgroundColor: '#FFFFFF',
        enableLinearGradient: false,
        quietZone: 0,
        ecl: 'M'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: false
    },
    
    'user-default': {
      id: 'user-default',
      type: 'link',
      label: 'My QR Code',
      data: {
        url: 'https://'
      },
      styleOptions: {
        color: '#000000',
        backgroundColor: '#FFFFFF',
        enableLinearGradient: false,
        quietZone: 0,
        ecl: 'M'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: true
    }
  },
  isLoading: false,
  error: null
};

type QRCodeAction = 
  | { type: 'SET_QR_CODES'; payload: Record<string, QRCodeItem> }
  | { type: 'ADD_QR_CODE'; payload: { qrCode: QRCodeItem } }
  | { type: 'UPDATE_QR_CODE'; payload: QRCodeItem }
  | { type: 'DELETE_QR_CODE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const qrCodeReducer = (state: QRCodeState, action: QRCodeAction): QRCodeState => {
  switch (action.type) {
    case 'SET_QR_CODES':
      return {
        ...state,
        qrCodes: action.payload,
      };
      
    case 'ADD_QR_CODE':
      const { qrCode: newQrCode } = action.payload;
      if (state.qrCodes[newQrCode.id]) {
          console.warn(`[Reducer] Attempted to add existing QR code ID: ${newQrCode.id}`);
          return state;
      }
      return {
        ...state,
        qrCodes: {
          ...state.qrCodes,
          [newQrCode.id]: newQrCode,
        },
      };
      
    case 'UPDATE_QR_CODE':
      const updatedQrCode = action.payload;
      const existingQrCode = state.qrCodes[updatedQrCode.id];

      if (!existingQrCode) {
           console.log(`[Reducer] ID ${updatedQrCode.id} not found for update. Adding instead.`);
           // Treat as an add if ID doesn't exist
           return {
             ...state,
             qrCodes: {
               ...state.qrCodes,
               [updatedQrCode.id]: { // Use the provided ID
                 ...updatedQrCode,
                 createdAt: new Date().toISOString(), // Set createdAt on initial add via update
                 updatedAt: new Date().toISOString(),
               },
             },
           };
      }
      // Otherwise, perform the update as before
      return {
        ...state,
        qrCodes: {
          ...state.qrCodes,
          [updatedQrCode.id]: {
            ...updatedQrCode,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      
    case 'DELETE_QR_CODE':
      const qrCodesAfterDelete = { ...state.qrCodes };
      const deletedId = action.payload;

      if (!qrCodesAfterDelete[deletedId]) {
        console.warn(`[Reducer] Attempted to delete non-existent QR code ID: ${deletedId}`);
        return state;
      }

      delete qrCodesAfterDelete[deletedId];
      console.log(`[Reducer] Deleted QR ID: ${deletedId}`);

      return {
        ...state,
        qrCodes: qrCodesAfterDelete,
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      // Check exhaustiveness manually or add helper
      return state;
  }
};

const QRCodeContext = createContext<QRCodeContextType | undefined>(undefined);

export const QRCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(qrCodeReducer, initialQRCodeState);
  
  const { isPremium, shouldShowOffer } = usePremium();

  useEffect(() => {
    const loadQRCodes = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const storedQRCodes = await AsyncStorage.getItem(QR_CODES_STORAGE_KEY);
        let loadedQRCodes = { ...initialQRCodeState.qrCodes }; 
        if (storedQRCodes) {
            try {
                const parsedQRCodes = JSON.parse(storedQRCodes);
                if (typeof parsedQRCodes === 'object' && parsedQRCodes !== null && Object.keys(parsedQRCodes).length > 0) {
                    loadedQRCodes = { ...initialQRCodeState.qrCodes, ...parsedQRCodes };
                } else { console.warn("Stored QR codes data invalid/empty."); }
            } catch (parseError) { console.error("Failed to parse stored QR codes.", parseError); }
        }
        if (!loadedQRCodes['qure-app']) loadedQRCodes['qure-app'] = initialQRCodeState.qrCodes['qure-app'];
        if (!loadedQRCodes['user-default']) loadedQRCodes['user-default'] = initialQRCodeState.qrCodes['user-default'];

        dispatch({ type: 'SET_QR_CODES', payload: loadedQRCodes });
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
         console.error('Failed to load QR codes from storage:', error);
         dispatch({ type: 'SET_ERROR', payload: 'Failed to load QR codes' });
         dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadQRCodes();
  }, []);
  
  useEffect(() => {
    const saveQRCodes = async () => {
      try {
        if (Object.keys(state.qrCodes).length > 0) {
            await AsyncStorage.setItem(QR_CODES_STORAGE_KEY, JSON.stringify(state.qrCodes));
        } else {
            await AsyncStorage.removeItem(QR_CODES_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to save QR codes to storage:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save QR codes' });
      }
    };
    
    if (!state.isLoading) {
      saveQRCodes();
    }
  }, [state.qrCodes]);
  
  const showPremiumUpgrade = (reason: string) => {
    console.log(`Premium upgrade prompt triggered: ${reason}`);
  };
  
  const canAddQRCode = (): boolean => {
    const userQRCodes = Object.values(state.qrCodes).filter(qr => qr.id !== 'qure-app');
    const isAddingFirstRealCode = userQRCodes.length === 1 && userQRCodes[0].id === 'user-default';

    if (isPremium || isAddingFirstRealCode) {
      return true;
    }

    if (!isPremium && userQRCodes.filter(qr => qr.id !== 'user-default').length >= 1) {
      if (shouldShowOffer('qr-add')) {
        showPremiumUpgrade('qr-add');
      }
      return false;
    }

    return true;
  };
  
  const canRemoveBranding = (): boolean => {
    if (!isPremium) {
      if (shouldShowOffer('branding-removal')) {
        showPremiumUpgrade('branding-removal');
      }
      return false;
    }
    return true;
  };
  
  const addQRCode = async (
    type: QRType,
    data: any,
    label: string = '',
    styleOptions = {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      enableLinearGradient: false,
      quietZone: 0,
      ecl: 'M' as 'L' | 'M' | 'Q' | 'H'
    }
  ): Promise<QRCodeItem> => {
    if (!canAddQRCode()) {
      showPremiumUpgrade(PREMIUM_REQUIRED_ERROR);
      throw new Error(PREMIUM_REQUIRED_ERROR);
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const finalLabel = label.trim() ? label.trim() : `${type.charAt(0).toUpperCase() + type.slice(1)} Code`;
      const newQRCode = createQRCodeItem(type, data, finalLabel, styleOptions);
      
      dispatch({ type: 'ADD_QR_CODE', payload: { qrCode: newQRCode } });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log(`[Context] Added QR Code ID: ${newQRCode.id}`);
      return newQRCode;
    } catch (error) {
      console.error('[Context] Error adding QR code:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add QR code' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };
  
  const updateQRCode = async (qrCode: QRCodeItem): Promise<void> => {
    console.log("[Context] updateQRCode called for ID:", qrCode.id);
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log("[Context] Dispatching UPDATE_QR_CODE for ID:", qrCode.id);
      dispatch({ type: 'UPDATE_QR_CODE', payload: qrCode });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('[Context] Failed to update QR code:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update QR code' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };
  
  const deleteQRCode = async (id: string): Promise<void> => {
    console.log("[Context] deleteQRCode called for ID:", id);
    if (id === 'qure-app') {
      const errorMsg = 'Cannot delete the QuRe app QR code';
      console.error("[Context]", errorMsg);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw new Error(errorMsg);
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log("[Context] Dispatching DELETE_QR_CODE for ID:", id);
      dispatch({ type: 'DELETE_QR_CODE', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('[Context] Failed to delete QR code:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete QR code' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };
  
  const getQRCodeValue = (id: string): string => {
    const qrCode = state.qrCodes[id];
    if (!qrCode) return '';
    return qrCodeItemToValue(qrCode);
  };
  
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };
  
  const contextValue: QRCodeContextType = {
    ...state,
    addQRCode,
    updateQRCode,
    deleteQRCode,
    getQRCodeValue,
    clearError,
    canAddQRCode,
    canRemoveBranding,
    showPremiumUpgrade,
  };
  
  return (
    <QRCodeContext.Provider value={contextValue}>
      {children}
    </QRCodeContext.Provider>
  );
};

export const useQRCode = (): QRCodeContextType => {
  const context = useContext(QRCodeContext);
  if (context === undefined) {
    throw new Error('useQRCode must be used within a QRCodeProvider');
  }
  return context;
};