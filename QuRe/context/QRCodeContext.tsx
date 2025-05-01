import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCodeState, QRCodeItem, QRType } from './QRCodeTypes';
import { createQRCodeItem, qrCodeItemToValue, parseQRCodeValue } from './QRCodeUtils';

// Define actions for the reducer
type QRCodeAction = 
  | { type: 'SET_QR_CODES'; payload: Record<string, QRCodeItem> }
  | { type: 'ADD_QR_CODE'; payload: QRCodeItem }
  | { type: 'UPDATE_QR_CODE'; payload: QRCodeItem }
  | { type: 'DELETE_QR_CODE'; payload: string }
  | { type: 'SET_ACTIVE_QR_CODE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial QR code state
const initialQRCodeState: QRCodeState = {
  qrCodes: {
    // Pre-populated QuRe app QR code (Link type)
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
        quietZone: 10,
        ecl: 'M'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: false
    },
    
    // Default user QR code (empty Link type)
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
        quietZone: 10,
        ecl: 'M'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: true
    }
  },
  activeQRCodeId: 'user-default',
  isLoading: false,
  error: null
};

// Create QR code reducer
const qrCodeReducer = (state: QRCodeState, action: QRCodeAction): QRCodeState => {
  switch (action.type) {
    case 'SET_QR_CODES':
      return {
        ...state,
        qrCodes: action.payload,
      };
      
    case 'ADD_QR_CODE':
      return {
        ...state,
        qrCodes: {
          ...state.qrCodes,
          [action.payload.id]: action.payload,
        },
        // Optionally set the new QR code as active
        activeQRCodeId: action.payload.isPrimary ? action.payload.id : state.activeQRCodeId,
      };
      
    case 'UPDATE_QR_CODE':
      return {
        ...state,
        qrCodes: {
          ...state.qrCodes,
          [action.payload.id]: {
            ...action.payload,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      
    case 'DELETE_QR_CODE':
      const newQRCodes = { ...state.qrCodes };
      delete newQRCodes[action.payload];
      
      // Update active QR code if the deleted one was active
      const newActiveQRCodeId = state.activeQRCodeId === action.payload
        ? Object.keys(newQRCodes)[0] || null
        : state.activeQRCodeId;
        
      return {
        ...state,
        qrCodes: newQRCodes,
        activeQRCodeId: newActiveQRCodeId,
      };
      
    case 'SET_ACTIVE_QR_CODE':
      return {
        ...state,
        activeQRCodeId: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
      
    default:
      return state;
  }
};

// Create the context
interface QRCodeContextType extends QRCodeState {
  addQRCode: (type: QRType, data: any, label?: string, styleOptions?: any) => Promise<QRCodeItem>;
  updateQRCode: (qrCode: QRCodeItem) => Promise<void>;
  deleteQRCode: (id: string) => Promise<void>;
  setActiveQRCode: (id: string) => Promise<void>;
  getQRCodeValue: (id: string) => string;
  clearError: () => void;
}

const QRCodeContext = createContext<QRCodeContextType | undefined>(undefined);

// Storage key for persisting QR codes
const QR_CODES_STORAGE_KEY = 'qure_app_qr_codes';
const ACTIVE_QR_CODE_STORAGE_KEY = 'qure_app_active_qr_code';

// Context provider component
export const QRCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(qrCodeReducer, initialQRCodeState);
  
  // Load QR codes from storage on initial render
  useEffect(() => {
    const loadQRCodes = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load QR codes
        const storedQRCodes = await AsyncStorage.getItem(QR_CODES_STORAGE_KEY);
        if (storedQRCodes) {
          const qrCodes = JSON.parse(storedQRCodes);
          dispatch({ type: 'SET_QR_CODES', payload: qrCodes });
        }
        
        // Load active QR code
        const activeQRCodeId = await AsyncStorage.getItem(ACTIVE_QR_CODE_STORAGE_KEY);
        if (activeQRCodeId) {
          dispatch({ type: 'SET_ACTIVE_QR_CODE', payload: activeQRCodeId });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Failed to load QR codes from storage:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load QR codes' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadQRCodes();
  }, []);
  
  // Save QR codes to storage whenever they change
  useEffect(() => {
    const saveQRCodes = async () => {
      try {
        await AsyncStorage.setItem(QR_CODES_STORAGE_KEY, JSON.stringify(state.qrCodes));
      } catch (error) {
        console.error('Failed to save QR codes to storage:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save QR codes' });
      }
    };
    
    if (!state.isLoading) {
      saveQRCodes();
    }
  }, [state.qrCodes]);
  
  // Save active QR code ID whenever it changes
  useEffect(() => {
    const saveActiveQRCode = async () => {
      try {
        if (state.activeQRCodeId) {
          await AsyncStorage.setItem(ACTIVE_QR_CODE_STORAGE_KEY, state.activeQRCodeId);
        } else {
          await AsyncStorage.removeItem(ACTIVE_QR_CODE_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to save active QR code ID to storage:', error);
      }
    };
    
    if (!state.isLoading && state.activeQRCodeId) {
      saveActiveQRCode();
    }
  }, [state.activeQRCodeId]);
  
  // Add a new QR code
  const addQRCode = async (
    type: QRType,
    data: any,
    label: string = '',
    styleOptions: any = undefined
  ): Promise<QRCodeItem> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newQRCode = createQRCodeItem(type, data, label, styleOptions);
      
      dispatch({ type: 'ADD_QR_CODE', payload: newQRCode });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return newQRCode;
    } catch (error) {
      console.error('Failed to add QR code:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add QR code' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };
  
  // Update an existing QR code
  const updateQRCode = async (qrCode: QRCodeItem): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      dispatch({ type: 'UPDATE_QR_CODE', payload: qrCode });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to update QR code:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update QR code' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };
  
  // Delete a QR code
  const deleteQRCode = async (id: string): Promise<void> => {
    try {
      // Don't allow deleting the built-in QuRe app QR code
      if (id === 'qure-app') {
        throw new Error('Cannot delete the QuRe app QR code');
      }
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      dispatch({ type: 'DELETE_QR_CODE', payload: id });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to delete QR code:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete QR code' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };
  
  // Set the active QR code
  const setActiveQRCode = async (id: string): Promise<void> => {
    try {
      if (!state.qrCodes[id]) {
        throw new Error(`QR code with ID ${id} not found`);
      }
      
      dispatch({ type: 'SET_ACTIVE_QR_CODE', payload: id });
    } catch (error) {
      console.error('Failed to set active QR code:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to set active QR code' });
      throw error;
    }
  };
  
  // Get the QR code value for a given ID
  const getQRCodeValue = (id: string): string => {
    const qrCode = state.qrCodes[id];
    if (!qrCode) {
      return '';
    }
    
    return qrCodeItemToValue(qrCode);
  };
  
  // Clear any errors
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };
  
  // Context value
  const contextValue: QRCodeContextType = {
    ...state,
    addQRCode,
    updateQRCode,
    deleteQRCode,
    setActiveQRCode,
    getQRCodeValue,
    clearError,
  };
  
  return (
    <QRCodeContext.Provider value={contextValue}>
      {children}
    </QRCodeContext.Provider>
  );
};

// Hook for using the QR code context
export const useQRCode = (): QRCodeContextType => {
  const context = useContext(QRCodeContext);
  if (context === undefined) {
    throw new Error('useQRCode must be used within a QRCodeProvider');
  }
  return context;
};