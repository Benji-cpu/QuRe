import { useState, useEffect, useCallback, useRef } from 'react';

export interface QRStylingOptions {
  // Basic options
  width: number;
  height: number;
  data: string;
  type: 'canvas' | 'svg';
  shape: 'square' | 'circle';
  
  // Logo options
  image?: string;
  imageOptions?: {
    hideBackgroundDots: boolean;
    imageSize: number; // 0.1-0.9
    margin: number; // 0-20
    crossOrigin: 'anonymous' | 'use-credentials';
  };
  
  // Dots options
  dotsOptions: {
    color: string;
    type: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number; // 0-360
      colorStops: Array<{
        offset: number; // 0-1
        color: string;
      }>;
    };
  };
  
  // Corner options
  cornersSquareOptions: {
    type?: 'dot' | 'square' | 'extra-rounded' | undefined;
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
    };
  };
  
  cornersDotOptions: {
    type?: 'dot' | 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded' | undefined;
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
    };
  };
  
  // Background options
  backgroundOptions: {
    color: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
    };
  };
}

// Frame options (custom implementation)
export interface FrameOptions {
  enabled: boolean;
  style: 'basic' | 'rounded' | 'circle' | 'fancy';
  width: number;
  color: string;
  text?: string;
  textColor?: string;
  fontFamily?: string;
}

export interface UseQRCodeStylingResult {
  options: QRStylingOptions;
  frameOptions: FrameOptions;
  updateOptions: (newOptions: Partial<QRStylingOptions>) => void;
  updateDotsOptions: (newOptions: Partial<QRStylingOptions['dotsOptions']>) => void;
  updateCornersSquareOptions: (newOptions: Partial<QRStylingOptions['cornersSquareOptions']>) => void;
  updateCornersDotOptions: (newOptions: Partial<QRStylingOptions['cornersDotOptions']>) => void;
  updateBackgroundOptions: (newOptions: Partial<QRStylingOptions['backgroundOptions']>) => void;
  updateImageOptions: (newOptions: Partial<NonNullable<QRStylingOptions['imageOptions']>>) => void;
  updateFrameOptions: (newOptions: Partial<FrameOptions>) => void;
  setLogo: (imageUrl: string | undefined) => void;
  resetToDefaults: () => void;
}

export const useQRCodeStyling = (initialData: string = ''): UseQRCodeStylingResult => {
  // Default options
  const defaultOptions: QRStylingOptions = {
    width: 300,
    height: 300,
    data: initialData,
    type: 'canvas',
    shape: 'square',
    dotsOptions: {
      color: '#000000',
      type: 'square',
    },
    cornersSquareOptions: {
      type: 'square',
      color: '#000000',
    },
    cornersDotOptions: {
      type: 'dot',
      color: '#000000',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
  };

  const defaultFrameOptions: FrameOptions = {
    enabled: false,
    style: 'basic',
    width: 10,
    color: '#000000',
  };

  // Previous data ref to track changes
  const prevDataRef = useRef<string>(initialData);

  // State for QR code styling options
  const [options, setOptions] = useState<QRStylingOptions>(defaultOptions);
  
  // State for frame options (custom implementation)
  const [frameOptions, setFrameOptions] = useState<FrameOptions>(defaultFrameOptions);

  // Update data when initialData changes
  useEffect(() => {
    if (initialData !== prevDataRef.current && initialData !== options.data) {
      setOptions(prevOptions => ({
        ...prevOptions,
        data: initialData
      }));
      prevDataRef.current = initialData;
    }
  }, [initialData, options.data]);

  // Update full options with memoized callback
  const updateOptions = useCallback((newOptions: Partial<QRStylingOptions>) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      ...newOptions,
    }));
  }, []);

  // Helper function to update nested options
  const updateNestedOptions = useCallback(<T extends keyof QRStylingOptions>(
    optionKey: T,
    newNestedOptions: Partial<NonNullable<QRStylingOptions[T]>>
  ) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      [optionKey]: {
        ...(prevOptions[optionKey] as any),
        ...newNestedOptions,
      },
    }));
  }, []);

  // Update dots options with memoized callback
  const updateDotsOptions = useCallback((newDotsOptions: Partial<QRStylingOptions['dotsOptions']>) => {
    updateNestedOptions('dotsOptions', newDotsOptions);
  }, [updateNestedOptions]);

  // Update corners square options with memoized callback
  const updateCornersSquareOptions = useCallback((newCornersOptions: Partial<QRStylingOptions['cornersSquareOptions']>) => {
    updateNestedOptions('cornersSquareOptions', newCornersOptions);
  }, [updateNestedOptions]);

  // Update corners dot options with memoized callback
  const updateCornersDotOptions = useCallback((newCornersOptions: Partial<QRStylingOptions['cornersDotOptions']>) => {
    updateNestedOptions('cornersDotOptions', newCornersOptions);
  }, [updateNestedOptions]);

  // Update background options with memoized callback
  const updateBackgroundOptions = useCallback((newBackgroundOptions: Partial<QRStylingOptions['backgroundOptions']>) => {
    updateNestedOptions('backgroundOptions', newBackgroundOptions);
  }, [updateNestedOptions]);

  // Update image options with memoized callback
  const updateImageOptions = useCallback((newImageOptions: Partial<NonNullable<QRStylingOptions['imageOptions']>>) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      imageOptions: {
        ...(prevOptions.imageOptions || {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
          crossOrigin: 'anonymous',
        }),
        ...newImageOptions,
      },
    }));
  }, []);

  // Set logo image with memoized callback
  const setLogo = useCallback((imageUrl: string | undefined) => {
    setOptions(prevOptions => {
      const newOptions = { ...prevOptions, image: imageUrl };
      
      // If imageUrl is provided and imageOptions doesn't exist, initialize it
      if (imageUrl && !prevOptions.imageOptions) {
        newOptions.imageOptions = {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
          crossOrigin: 'anonymous',
        };
      }
      
      return newOptions;
    });
  }, []);

  // Update frame options with memoized callback
  const updateFrameOptions = useCallback((newFrameOptions: Partial<FrameOptions>) => {
    setFrameOptions(prevOptions => ({
      ...prevOptions,
      ...newFrameOptions,
    }));
  }, []);

  // Reset to defaults with memoized callback
  const resetToDefaults = useCallback(() => {
    setOptions(defaultOptions);
    setFrameOptions(defaultFrameOptions);
  }, []);

  return {
    options,
    frameOptions,
    updateOptions,
    updateDotsOptions,
    updateCornersSquareOptions,
    updateCornersDotOptions,
    updateBackgroundOptions,
    updateImageOptions,
    updateFrameOptions,
    setLogo,
    resetToDefaults,
  };
}; 