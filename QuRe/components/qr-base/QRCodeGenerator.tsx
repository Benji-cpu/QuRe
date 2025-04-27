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
  const loadTimeout = useRef<NodeJS.Timeout | null>(null);

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
  
  // Reset state when props change
  useEffect(() => {
    setIsGenerating(true);
    setHasError(false);
    retryCount.current = 0;
    
    // Clear previous timeout
    if (loadTimeout.current) {
      clearTimeout(loadTimeout.current);
    }
    
    // Set a timeout to switch to fallback if loading takes too long
    loadTimeout.current = setTimeout(() => {
      if (isGenerating) {
        setHasError(true);
        setIsGenerating(false);
        if (onGenerated) {
          onGenerated(false, null);
        }
      }
    }, 3000);
    
    return () => {
      if (loadTimeout.current) {
        clearTimeout(loadTimeout.current);
      }
    };
  }, [qrOptions, onGenerated]);
  
  const generateQRCode = useMemo(() => {
    try {
      const jsonOptions = JSON.stringify(qrOptions).replace(/"/g, '\\"');
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html { margin: 0; padding: 0; overflow: hidden; background: transparent; }
            #canvas { display: flex; justify-content: center; align-items: center; height: 100%; }
            #error { display: none; color: red; text-align: center; padding: 10px; }
            #loading { display: flex; justify-content: center; align-items: center; height: 100%; }
          </style>
        </head>
        <body>
          <div id="loading">Loading QR code...</div>
          <div id="canvas"></div>
          <div id="error"></div>
          
          <script src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
          
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              let loaded = false;
              
              // Check if library is loaded
              function checkLibrary() {
                try {
                  if (window.QRCodeStyling) {
                    document.getElementById('loading').style.display = 'none';
                    
                    const options = JSON.parse("${jsonOptions}");
                    const qrCode = new QRCodeStyling(options);
                    qrCode.append(document.getElementById("canvas"));
                    
                    loaded = true;
                    window.ReactNativeWebView.postMessage('QR_RENDERED');
                  } else {
                    throw new Error('QR Code library not loaded');
                  }
                } catch (e) {
                  console.error('QR Code error:', e);
                  document.getElementById('error').textContent = e.message;
                  document.getElementById('error').style.display = 'block';
                  window.ReactNativeWebView.postMessage('QR_ERROR:' + e.message);
                }
              }
              
              // Initial check
              checkLibrary();
              
              // Retry after a short delay to ensure library is loaded
              setTimeout(function() {
                if (!loaded) {
                  checkLibrary();
                }
              }, 500);
              
              // Final fallback
              setTimeout(function() {
                if (!loaded) {
                  window.ReactNativeWebView.postMessage('QR_TIMEOUT');
                }
              }, 2000);
            });
            
            // Handle script load error
            window.onerror = function(message, source, lineno, colno, error) {
              document.getElementById('error').textContent = 'Script error: ' + message;
              document.getElementById('error').style.display = 'block';
              window.ReactNativeWebView.postMessage('QR_ERROR:' + message);
              return true;
            };
          </script>
        </body>
        </html>
      `;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.error('Error generating QR code HTML:', errorMessage);
      return generateFallbackQR();
    }
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
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            window.ReactNativeWebView.postMessage('QR_FALLBACK');
          });
        </script>
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
      if (loadTimeout.current) {
        clearTimeout(loadTimeout.current);
        loadTimeout.current = null;
      }
    } else if (message === 'QR_FALLBACK') {
      setIsGenerating(false);
      setHasError(false);
      if (onGenerated) {
        onGenerated(true, webViewRef.current);
      }
    } else if (message === 'QR_TIMEOUT' || message.startsWith('QR_ERROR:')) {
      setHasError(true);
      setIsGenerating(false);
      if (onGenerated) {
        onGenerated(false, null);
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
          onMessage={handleMessage}
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