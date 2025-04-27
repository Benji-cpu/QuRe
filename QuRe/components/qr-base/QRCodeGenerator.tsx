import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const webViewRef = useRef<WebView | null>(null);

  const qrOptions = useMemo(() => {
    if (!styleOptions) {
      return {
        backgroundOptions: { color: 'white' },
        dotsOptions: { color: 'black' }
      };
    }
    
    const options = styleOptions.options || styleOptions;
    
    const result: any = {
      width: size,
      height: size,
      type: 'svg',
      data: value,
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
    const timer = setTimeout(() => {
      setIsGenerating(false);
      if (onGenerated) {
        onGenerated(true, webViewRef.current);
      }
    }, 300);
    
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
        </style>
      </head>
      <body>
        <div id="canvas"></div>
        <script>
          const options = JSON.parse("${jsonOptions}");
          const qrCode = new QRCodeStyling(options);
          qrCode.append(document.getElementById("canvas"));
          window.ReactNativeWebView.postMessage('QR_RENDERED');
        </script>
      </body>
      </html>
    `;
  }, [qrOptions]);

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === 'QR_RENDERED') {
      setIsGenerating(false);
      if (onGenerated) {
        onGenerated(true, webViewRef.current);
      }
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {isGenerating ? (
        <ActivityIndicator size="large" color="#10b981" />
      ) : value ? (
        <WebView
          ref={webViewRef}
          source={{ html: generateQRCode }}
          style={{ width: size, height: size, backgroundColor: 'transparent' }}
          scrollEnabled={false}
          onMessage={handleMessage}
          originWhitelist={['*']}
        />
      ) : (
        <View style={[styles.emptyQR, { width: size, height: size }]} />
      )}
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