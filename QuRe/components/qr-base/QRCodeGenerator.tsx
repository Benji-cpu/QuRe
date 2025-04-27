import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { WebView } from 'react-native-webview';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  styleOptions?: any;
  onGenerated?: (success: boolean, svgRef?: any) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  styleOptions,
  onGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef<WebView | null>(null);
  const retryCount = useRef(0);

  const qrOptions = useMemo(() => {
    if (!styleOptions) {
      return {
        width: size,
        height: size,
        data: value || 'https://qr.io/',
        type: 'svg',
        backgroundOptions: { color: 'white' },
        dotsOptions: { color: 'black' }
      };
    }
    
    const options = styleOptions.options || styleOptions;
    
    const result: any = {
      width: size,
      height: size,
      type: 'svg',
      data: value || 'https://qr.io/',
      backgroundOptions: {
        color: options.backgroundOptions?.color || 'white'
      },
      dotsOptions: {
        color: options.dotsOptions?.color || 'black',
        type: options.dotsOptions?.type || 'square'
      }
    };
    
    if (options.image) {
      result.image = options.image;
      result.imageOptions = {
        hideBackgroundDots: options.imageOptions?.hideBackgroundDots !== false,
        imageSize: options.imageOptions?.imageSize || 0.4,
        margin: options.imageOptions?.margin || 0,
        crossOrigin: 'anonymous'
      };
    }
    
    if (options.cornersSquareOptions?.type) {
      result.cornersSquareOptions = {
        type: options.cornersSquareOptions.type,
        color: options.cornersSquareOptions.color
      };
    }
    
    if (options.cornersDotOptions?.type) {
      result.cornersDotOptions = {
        type: options.cornersDotOptions.type,
        color: options.cornersDotOptions.color
      };
    }
    
    if (options.shape) {
      result.shape = options.shape;
    }
    
    return result;
  }, [styleOptions, size, value]);
  
  useEffect(() => {
    setIsGenerating(true);
    setHasError(false);
    retryCount.current = 0;
    
    const timer = setTimeout(() => {
      if (isGenerating && retryCount.current >= 2) {
        setHasError(true);
        setIsGenerating(false);
        if (onGenerated) {
          onGenerated(false, null);
        }
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [qrOptions, onGenerated]);
  
  const generateQRCode = useMemo(() => {
    const jsonOptions = JSON.stringify(qrOptions).replace(/"/g, '\\"');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
        <style>
          body, html { margin: 0; padding: 0; overflow: hidden; background: transparent; }
          #canvas { display: flex; justify-content: center; align-items: center; height: 100%; }
          #fallback { display: none; }
        </style>
      </head>
      <body>
        <div id="canvas"></div>
        <div id="fallback"></div>
        <script>
          try {
            const options = JSON.parse("${jsonOptions}");
            if (window.QRCodeStyling) {
              const qrCode = new QRCodeStyling(options);
              qrCode.append(document.getElementById("canvas"));
              window.ReactNativeWebView.postMessage('QR_RENDERED');
            } else {
              setTimeout(() => {
                if (window.QRCodeStyling) {
                  const qrCode = new QRCodeStyling(options);
                  qrCode.append(document.getElementById("canvas"));
                  window.ReactNativeWebView.postMessage('QR_RENDERED');
                } else {
                  window.ReactNativeWebView.postMessage('QR_LIBRARY_MISSING');
                }
              }, 1000);
            }
          } catch (e) {
            window.ReactNativeWebView.postMessage('QR_ERROR:' + e.message);
          }
        </script>
      </body>
      </html>
    `;
  }, [qrOptions]);

  const generateFallbackQR = () => {
    const encodedData = encodeURIComponent(value || 'https://qr.io/');
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; overflow: hidden; background: white; }
          img { width: 100%; height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}" />
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    const message = event.nativeEvent.data;
    
    if (message === 'QR_RENDERED') {
      setIsGenerating(false);
      setHasError(false);
      if (onGenerated) {
        onGenerated(true, webViewRef.current);
      }
    } else if (message === 'QR_LIBRARY_MISSING' || message.startsWith('QR_ERROR:')) {
      retryCount.current += 1;
      
      if (retryCount.current >= 2) {
        setHasError(true);
        setIsGenerating(false);
        if (onGenerated) {
          onGenerated(false, null);
        }
      }
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsGenerating(false);
    if (onGenerated) {
      onGenerated(false, null);
    }
  };

  const renderContent = () => {
    if (isGenerating) {
      return <ActivityIndicator size="large" color="#10b981" />;
    }
    
    if (hasError) {
      return (
        <WebView
          source={{ html: generateFallbackQR() }}
          style={{ width: size, height: size, backgroundColor: 'white' }}
          scrollEnabled={false}
          originWhitelist={['*']}
        />
      );
    }
    
    if (!value) {
      return <View style={[styles.emptyQR, { width: size, height: size }]} />;
    }
    
    return (
      <WebView
        ref={webViewRef}
        source={{ html: generateQRCode }}
        style={{ width: size, height: size, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        onMessage={handleMessage}
        onError={handleError}
        originWhitelist={['*']}
      />
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyQR: {
    backgroundColor: '#EEEEEE',
  }
});

export default QRCodeGenerator;