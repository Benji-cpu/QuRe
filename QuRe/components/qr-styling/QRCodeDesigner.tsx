import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text
} from 'react-native';
import { WebView } from 'react-native-webview';
import QRCodeStyling from 'qr-code-styling';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useQRCodeStyling } from '@/hooks/useQRCodeStyling';

// Import allowed type values for strong typing
import type { 
  QRStylingOptions, 
  FrameOptions 
} from '@/hooks/useQRCodeStyling';

// Tabs
import DotsTab from './tabs/DotsTab';
import CornersTab from './tabs/CornersTab';
import BackgroundTab from './tabs/BackgroundTab';
import LogoTab from './tabs/LogoTab';
import FrameTab from './tabs/FrameTab';
import ShapeTab from './tabs/ShapeTab';

// Tab identifiers
type TabKey = 'dots' | 'corners' | 'background' | 'logo' | 'frame' | 'shape';

// Allowed dots types
type DotsType = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';

// Allowed corners square types
type CornersSquareType = 'square' | 'dot' | 'extra-rounded';

// Allowed corners dot types
type CornersDotType = 'dot' | 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';

// Allowed frame style types
type FrameStyleType = 'basic' | 'rounded' | 'circle' | 'fancy';

interface QRCodeDesignerProps {
  data: string;
  isPremium?: boolean;
  onStyleChange?: (options: any) => void;
}

const QRCodeDesigner: React.FC<QRCodeDesignerProps> = ({
  data,
  isPremium = false,
  onStyleChange,
}) => {
  // Get theme colors
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  // Use the QR code styling hook
  const qrStylingState = useQRCodeStyling(data);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabKey>('dots');
  
  // WebView ref for QR code rendering
  const webViewRef = useRef<WebView>(null);
  
  // HTML to render QR code in WebView
  const [html, setHtml] = useState('');

  // Previous data reference to prevent unnecessary updates
  const prevDataRef = useRef<string>(data);
  
  // Memoize QR options to prevent unnecessary updates
  const qrOptions = useMemo(() => {
    return {
      width: 250,
      height: 250,
      type: "svg",
      data: qrStylingState.options.data,
      image: qrStylingState.options.image,
      dotsOptions: qrStylingState.options.dotsOptions,
      cornersSquareOptions: qrStylingState.options.cornersSquareOptions,
      cornersDotOptions: qrStylingState.options.cornersDotOptions,
      backgroundOptions: qrStylingState.options.backgroundOptions,
      imageOptions: qrStylingState.options.imageOptions,
      shape: qrStylingState.options.shape
    };
  }, [
    qrStylingState.options.data,
    qrStylingState.options.image,
    qrStylingState.options.dotsOptions,
    qrStylingState.options.cornersSquareOptions,
    qrStylingState.options.cornersDotOptions,
    qrStylingState.options.backgroundOptions,
    qrStylingState.options.imageOptions,
    qrStylingState.options.shape
  ]);
  
  // Memoize frame options
  const frameOptionsJson = useMemo(() => {
    return JSON.stringify(qrStylingState.frameOptions);
  }, [qrStylingState.frameOptions]);
  
  // Callback for notifying parent of style changes
  const notifyParentOfChanges = useCallback(() => {
    if (onStyleChange) {
      onStyleChange({
        options: qrStylingState.options,
        frameOptions: qrStylingState.frameOptions
      });
    }
  }, [onStyleChange, qrStylingState.options, qrStylingState.frameOptions]);

  // Separate useEffect for parent notification to prevent circular updates
  useEffect(() => {
    notifyParentOfChanges();
  }, [notifyParentOfChanges]);
  
  // Generate QR code as SVG using qr-code-styling
  useEffect(() => {
    // Only continue if data is available and has changed or options have changed
    if (!data) return;
    
    // Create an HTML template for the WebView that includes qr-code-styling library
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
          }
          #canvas {
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div id="canvas"></div>
        <script>
          // Configure QR code options
          const qrCode = new QRCodeStyling(${JSON.stringify(qrOptions)});
          
          // Render QR code
          qrCode.append(document.getElementById("canvas"));
          
          // Handle custom frame if enabled
          ${qrStylingState.frameOptions.enabled ? `
            // Custom frame implementation
            setTimeout(() => {
              const svg = document.querySelector('svg');
              const frameColor = "${qrStylingState.frameOptions.color}";
              const frameWidth = ${qrStylingState.frameOptions.width};
              const frameStyle = "${qrStylingState.frameOptions.style}";
              const frameText = "${qrStylingState.frameOptions.text || ''}";
              const textColor = "${qrStylingState.frameOptions.textColor || '#000000'}";
              const fontFamily = "${qrStylingState.frameOptions.fontFamily || 'Arial'}";
              
              // Get SVG dimensions
              const width = parseInt(svg.getAttribute('width'));
              const height = parseInt(svg.getAttribute('height'));
              
              // Create frame based on style
              let frameEl;
              if (frameStyle === 'circle') {
                frameEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                frameEl.setAttribute("cx", width / 2);
                frameEl.setAttribute("cy", height / 2);
                frameEl.setAttribute("r", (width / 2) + (frameWidth / 2));
                frameEl.setAttribute("stroke", frameColor);
                frameEl.setAttribute("stroke-width", frameWidth);
                frameEl.setAttribute("fill", "none");
              } else if (frameStyle === 'rounded') {
                frameEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                frameEl.setAttribute("x", -frameWidth / 2);
                frameEl.setAttribute("y", -frameWidth / 2);
                frameEl.setAttribute("width", width + frameWidth);
                frameEl.setAttribute("height", height + frameWidth);
                frameEl.setAttribute("rx", 20);
                frameEl.setAttribute("ry", 20);
                frameEl.setAttribute("stroke", frameColor);
                frameEl.setAttribute("stroke-width", frameWidth);
                frameEl.setAttribute("fill", "none");
              } else if (frameStyle === 'fancy') {
                // Create a fancy frame with decorative corners
                const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                
                // Main rectangle
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", -frameWidth / 2);
                rect.setAttribute("y", -frameWidth / 2);
                rect.setAttribute("width", width + frameWidth);
                rect.setAttribute("height", height + frameWidth);
                rect.setAttribute("stroke", frameColor);
                rect.setAttribute("stroke-width", frameWidth / 2);
                rect.setAttribute("fill", "none");
                
                // Corner decorations
                const cornerSize = 20;
                
                // Top left corner
                const topLeft = document.createElementNS("http://www.w3.org/2000/svg", "path");
                topLeft.setAttribute("d", \`M \${-frameWidth / 2} \${cornerSize + frameWidth / 2} V \${-frameWidth / 2} H \${cornerSize + frameWidth / 2}\`);
                topLeft.setAttribute("stroke", frameColor);
                topLeft.setAttribute("stroke-width", frameWidth);
                topLeft.setAttribute("fill", "none");
                
                // Top right corner
                const topRight = document.createElementNS("http://www.w3.org/2000/svg", "path");
                topRight.setAttribute("d", \`M \${width - cornerSize + frameWidth / 2} \${-frameWidth / 2} H \${width + frameWidth / 2} V \${cornerSize + frameWidth / 2}\`);
                topRight.setAttribute("stroke", frameColor);
                topRight.setAttribute("stroke-width", frameWidth);
                topRight.setAttribute("fill", "none");
                
                // Bottom left corner
                const bottomLeft = document.createElementNS("http://www.w3.org/2000/svg", "path");
                bottomLeft.setAttribute("d", \`M \${-frameWidth / 2} \${height - cornerSize + frameWidth / 2} V \${height + frameWidth / 2} H \${cornerSize + frameWidth / 2}\`);
                bottomLeft.setAttribute("stroke", frameColor);
                bottomLeft.setAttribute("stroke-width", frameWidth);
                bottomLeft.setAttribute("fill", "none");
                
                // Bottom right corner
                const bottomRight = document.createElementNS("http://www.w3.org/2000/svg", "path");
                bottomRight.setAttribute("d", \`M \${width - cornerSize + frameWidth / 2} \${height + frameWidth / 2} H \${width + frameWidth / 2} V \${height - cornerSize + frameWidth / 2}\`);
                bottomRight.setAttribute("stroke", frameColor);
                bottomRight.setAttribute("stroke-width", frameWidth);
                bottomRight.setAttribute("fill", "none");
                
                group.appendChild(rect);
                group.appendChild(topLeft);
                group.appendChild(topRight);
                group.appendChild(bottomLeft);
                group.appendChild(bottomRight);
                
                frameEl = group;
              } else {
                // Default 'basic' frame (square)
                frameEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                frameEl.setAttribute("x", -frameWidth / 2);
                frameEl.setAttribute("y", -frameWidth / 2);
                frameEl.setAttribute("width", width + frameWidth);
                frameEl.setAttribute("height", height + frameWidth);
                frameEl.setAttribute("stroke", frameColor);
                frameEl.setAttribute("stroke-width", frameWidth);
                frameEl.setAttribute("fill", "none");
              }
              
              // Add frame to SVG
              svg.insertBefore(frameEl, svg.firstChild);
              
              // Add text if specified
              if (frameText) {
                const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textEl.setAttribute("x", width / 2);
                textEl.setAttribute("y", height + frameWidth + 25);
                textEl.setAttribute("text-anchor", "middle");
                textEl.setAttribute("font-family", fontFamily === 'default' ? 'Arial' : fontFamily);
                textEl.setAttribute("font-size", "14px");
                textEl.setAttribute("fill", textColor);
                textEl.textContent = frameText;
                
                // Extend SVG height to accommodate text
                svg.setAttribute("height", (height + frameWidth + 40) + "px");
                svg.appendChild(textEl);
              }
            }, 100);
          ` : ''}
          
          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'download') {
              const dataUrl = document.querySelector('svg').outerHTML;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'qrcode',
                data: dataUrl
              }));
            }
          });
        </script>
      </body>
      </html>
    `;
    
    setHtml(htmlTemplate);
    prevDataRef.current = data;
  }, [qrOptions, frameOptionsJson, data]);
  
  // Tab configuration
  const tabs: Record<TabKey, { label: string, icon: string }> = {
    dots: { label: 'Dots', icon: '••••' },
    corners: { label: 'Corners', icon: '⬣' },
    background: { label: 'Background', icon: '🎨' },
    logo: { label: 'Logo', icon: '🖼️' },
    frame: { label: 'Frame', icon: '▢' },
    shape: { label: 'Shape', icon: '◯' },
  };
  
  // Handle WebView messages (for downloading QR code)
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'qrcode') {
        // Here you can handle the QR code data (SVG)
        // For example, you could save it or share it
        console.log('Received QR code SVG');
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };
  
  // Check if gradient is enabled for dots
  const dotsHasGradient = !!qrStylingState.options.dotsOptions.gradient;
  
  // Get gradient settings for dots
  const dotsGradientType = qrStylingState.options.dotsOptions.gradient?.type || 'linear';
  const dotsGradientRotation = qrStylingState.options.dotsOptions.gradient?.rotation || 0;
  const dotsGradientStartColor = qrStylingState.options.dotsOptions.gradient?.colorStops?.[0]?.color || '#000000';
  const dotsGradientEndColor = qrStylingState.options.dotsOptions.gradient?.colorStops?.[1]?.color || '#000000';
  
  // Helper for updating dot gradient
  const updateDotsGradient = (useGradient: boolean) => {
    if (useGradient) {
      qrStylingState.updateDotsOptions({
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: '#000000' },
            { offset: 1, color: '#0080ff' }
          ]
        }
      });
    } else {
      const newOptions = { ...qrStylingState.options.dotsOptions };
      delete newOptions.gradient;
      qrStylingState.updateDotsOptions(newOptions);
    }
  };
  
  // Check if corner squares have gradient
  const squareHasGradient = !!qrStylingState.options.cornersSquareOptions.gradient;
  
  // Get gradient settings for corner squares
  const squareGradientType = qrStylingState.options.cornersSquareOptions.gradient?.type || 'linear';
  const squareGradientRotation = qrStylingState.options.cornersSquareOptions.gradient?.rotation || 0;
  const squareGradientStartColor = qrStylingState.options.cornersSquareOptions.gradient?.colorStops?.[0]?.color || '#000000';
  const squareGradientEndColor = qrStylingState.options.cornersSquareOptions.gradient?.colorStops?.[1]?.color || '#000000';
  
  // Helper for updating corner square gradient
  const updateSquareGradient = (useGradient: boolean) => {
    if (useGradient) {
      qrStylingState.updateCornersSquareOptions({
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: '#000000' },
            { offset: 1, color: '#0080ff' }
          ]
        }
      });
    } else {
      const newOptions = { ...qrStylingState.options.cornersSquareOptions };
      delete newOptions.gradient;
      qrStylingState.updateCornersSquareOptions(newOptions);
    }
  };
  
  // Check if corner dots have gradient
  const dotHasGradient = !!qrStylingState.options.cornersDotOptions.gradient;
  
  // Get gradient settings for corner dots
  const dotGradientType = qrStylingState.options.cornersDotOptions.gradient?.type || 'linear';
  const dotGradientRotation = qrStylingState.options.cornersDotOptions.gradient?.rotation || 0;
  const dotGradientStartColor = qrStylingState.options.cornersDotOptions.gradient?.colorStops?.[0]?.color || '#000000';
  const dotGradientEndColor = qrStylingState.options.cornersDotOptions.gradient?.colorStops?.[1]?.color || '#000000';
  
  // Helper for updating corner dot gradient
  const updateDotGradient = (useGradient: boolean) => {
    if (useGradient) {
      qrStylingState.updateCornersDotOptions({
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: '#000000' },
            { offset: 1, color: '#0080ff' }
          ]
        }
      });
    } else {
      const newOptions = { ...qrStylingState.options.cornersDotOptions };
      delete newOptions.gradient;
      qrStylingState.updateCornersDotOptions(newOptions);
    }
  };
  
  // Check if background has gradient
  const bgHasGradient = !!qrStylingState.options.backgroundOptions.gradient;
  
  // Get gradient settings for background
  const bgGradientType = qrStylingState.options.backgroundOptions.gradient?.type || 'linear';
  const bgGradientRotation = qrStylingState.options.backgroundOptions.gradient?.rotation || 0;
  const bgGradientStartColor = qrStylingState.options.backgroundOptions.gradient?.colorStops?.[0]?.color || '#ffffff';
  const bgGradientEndColor = qrStylingState.options.backgroundOptions.gradient?.colorStops?.[1]?.color || '#ffffff';
  
  // Check if background is transparent
  const isBgTransparent = qrStylingState.options.backgroundOptions.color === 'transparent';
  
  // Helper for updating background gradient
  const updateBgGradient = (useGradient: boolean) => {
    if (useGradient) {
      qrStylingState.updateBackgroundOptions({
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: '#ffffff' },
            { offset: 1, color: '#f0f0f0' }
          ]
        }
      });
    } else {
      const newOptions = { ...qrStylingState.options.backgroundOptions };
      delete newOptions.gradient;
      qrStylingState.updateBackgroundOptions(newOptions);
    }
  };
  
  // Helper for updating background transparency
  const updateBgTransparency = (isTransparent: boolean) => {
    qrStylingState.updateBackgroundOptions({
      color: isTransparent ? 'transparent' : '#ffffff'
    });
  };
  
  return (
    <View style={styles.container} testID="qr-code-designer">
      {/* QR Code Preview */}
      <View style={[styles.previewContainer, { backgroundColor: bgColor, borderColor }]}>
        <Text style={styles.scanMeText}>SCAN ME</Text>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          scrollEnabled={false}
          testID="qr-webview"
        />
      </View>
      
      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {Object.entries(tabs).map(([key, { label, icon }]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              activeTab === key && [styles.activeTab, { borderColor: tintColor }]
            ]}
            onPress={() => setActiveTab(key as TabKey)}
            testID={`tab-${key}`}
          >
            <Text style={styles.tabIcon}>{icon}</Text>
            <Text 
              style={[
                styles.tabLabel, 
                { color: textColor },
                activeTab === key && { color: tintColor }
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Tab Content */}
      <ScrollView style={styles.contentScroll} testID={`content-${activeTab}`}>
        {activeTab === 'dots' && (
          <DotsTab
            color={qrStylingState.options.dotsOptions.color}
            type={qrStylingState.options.dotsOptions.type}
            hasGradient={dotsHasGradient}
            gradientType={dotsGradientType}
            gradientStartColor={dotsGradientStartColor}
            gradientEndColor={dotsGradientEndColor}
            gradientRotation={dotsGradientRotation}
            onColorChange={(color) => qrStylingState.updateDotsOptions({ color })}
            onTypeChange={(type) => qrStylingState.updateDotsOptions({ type: type as DotsType })}
            onGradientChange={updateDotsGradient}
            onGradientTypeChange={(type) => {
              qrStylingState.updateDotsOptions({
                gradient: {
                  ...qrStylingState.options.dotsOptions.gradient!,
                  type
                }
              });
            }}
            onGradientStartColorChange={(color) => {
              qrStylingState.updateDotsOptions({
                gradient: {
                  ...qrStylingState.options.dotsOptions.gradient!,
                  colorStops: [
                    { offset: 0, color },
                    qrStylingState.options.dotsOptions.gradient!.colorStops[1]
                  ]
                }
              });
            }}
            onGradientEndColorChange={(color) => {
              qrStylingState.updateDotsOptions({
                gradient: {
                  ...qrStylingState.options.dotsOptions.gradient!,
                  colorStops: [
                    qrStylingState.options.dotsOptions.gradient!.colorStops[0],
                    { offset: 1, color }
                  ]
                }
              });
            }}
            onGradientRotationChange={(rotation) => {
              qrStylingState.updateDotsOptions({
                gradient: {
                  ...qrStylingState.options.dotsOptions.gradient!,
                  rotation
                }
              });
            }}
          />
        )}
        
        {activeTab === 'corners' && (
          <CornersTab
            // Corner Square props
            squareType={qrStylingState.options.cornersSquareOptions.type}
            squareColor={qrStylingState.options.cornersSquareOptions.color}
            squareHasGradient={squareHasGradient}
            squareGradientType={squareGradientType}
            squareGradientStartColor={squareGradientStartColor}
            squareGradientEndColor={squareGradientEndColor}
            squareGradientRotation={squareGradientRotation}
            
            // Corner Dot props
            dotType={qrStylingState.options.cornersDotOptions.type}
            dotColor={qrStylingState.options.cornersDotOptions.color}
            dotHasGradient={dotHasGradient}
            dotGradientType={dotGradientType}
            dotGradientStartColor={dotGradientStartColor}
            dotGradientEndColor={dotGradientEndColor}
            dotGradientRotation={dotGradientRotation}
            
            // Callbacks for Corner Square
            onSquareTypeChange={(type) => qrStylingState.updateCornersSquareOptions({ type: type as CornersSquareType })}
            onSquareColorChange={(color) => qrStylingState.updateCornersSquareOptions({ color })}
            onSquareGradientChange={updateSquareGradient}
            onSquareGradientTypeChange={(type) => {
              qrStylingState.updateCornersSquareOptions({
                gradient: {
                  ...qrStylingState.options.cornersSquareOptions.gradient!,
                  type
                }
              });
            }}
            onSquareGradientStartColorChange={(color) => {
              qrStylingState.updateCornersSquareOptions({
                gradient: {
                  ...qrStylingState.options.cornersSquareOptions.gradient!,
                  colorStops: [
                    { offset: 0, color },
                    qrStylingState.options.cornersSquareOptions.gradient!.colorStops[1]
                  ]
                }
              });
            }}
            onSquareGradientEndColorChange={(color) => {
              qrStylingState.updateCornersSquareOptions({
                gradient: {
                  ...qrStylingState.options.cornersSquareOptions.gradient!,
                  colorStops: [
                    qrStylingState.options.cornersSquareOptions.gradient!.colorStops[0],
                    { offset: 1, color }
                  ]
                }
              });
            }}
            onSquareGradientRotationChange={(rotation) => {
              qrStylingState.updateCornersSquareOptions({
                gradient: {
                  ...qrStylingState.options.cornersSquareOptions.gradient!,
                  rotation
                }
              });
            }}
            
            // Callbacks for Corner Dot
            onDotTypeChange={(type) => qrStylingState.updateCornersDotOptions({ type: type as CornersDotType })}
            onDotColorChange={(color) => qrStylingState.updateCornersDotOptions({ color })}
            onDotGradientChange={updateDotGradient}
            onDotGradientTypeChange={(type) => {
              qrStylingState.updateCornersDotOptions({
                gradient: {
                  ...qrStylingState.options.cornersDotOptions.gradient!,
                  type
                }
              });
            }}
            onDotGradientStartColorChange={(color) => {
              qrStylingState.updateCornersDotOptions({
                gradient: {
                  ...qrStylingState.options.cornersDotOptions.gradient!,
                  colorStops: [
                    { offset: 0, color },
                    qrStylingState.options.cornersDotOptions.gradient!.colorStops[1]
                  ]
                }
              });
            }}
            onDotGradientEndColorChange={(color) => {
              qrStylingState.updateCornersDotOptions({
                gradient: {
                  ...qrStylingState.options.cornersDotOptions.gradient!,
                  colorStops: [
                    qrStylingState.options.cornersDotOptions.gradient!.colorStops[0],
                    { offset: 1, color }
                  ]
                }
              });
            }}
            onDotGradientRotationChange={(rotation) => {
              qrStylingState.updateCornersDotOptions({
                gradient: {
                  ...qrStylingState.options.cornersDotOptions.gradient!,
                  rotation
                }
              });
            }}
          />
        )}
        
        {activeTab === 'background' && (
          <BackgroundTab
            color={qrStylingState.options.backgroundOptions.color}
            hasGradient={bgHasGradient}
            gradientType={bgGradientType}
            gradientStartColor={bgGradientStartColor}
            gradientEndColor={bgGradientEndColor}
            gradientRotation={bgGradientRotation}
            isTransparent={isBgTransparent}
            onColorChange={(color) => qrStylingState.updateBackgroundOptions({ color })}
            onGradientChange={updateBgGradient}
            onGradientTypeChange={(type) => {
              qrStylingState.updateBackgroundOptions({
                gradient: {
                  ...qrStylingState.options.backgroundOptions.gradient!,
                  type
                }
              });
            }}
            onGradientStartColorChange={(color) => {
              qrStylingState.updateBackgroundOptions({
                gradient: {
                  ...qrStylingState.options.backgroundOptions.gradient!,
                  colorStops: [
                    { offset: 0, color },
                    qrStylingState.options.backgroundOptions.gradient!.colorStops[1]
                  ]
                }
              });
            }}
            onGradientEndColorChange={(color) => {
              qrStylingState.updateBackgroundOptions({
                gradient: {
                  ...qrStylingState.options.backgroundOptions.gradient!,
                  colorStops: [
                    qrStylingState.options.backgroundOptions.gradient!.colorStops[0],
                    { offset: 1, color }
                  ]
                }
              });
            }}
            onGradientRotationChange={(rotation) => {
              qrStylingState.updateBackgroundOptions({
                gradient: {
                  ...qrStylingState.options.backgroundOptions.gradient!,
                  rotation
                }
              });
            }}
            onTransparencyChange={updateBgTransparency}
          />
        )}
        
        {activeTab === 'logo' && (
          <LogoTab
            logoImage={qrStylingState.options.image}
            logoSize={qrStylingState.options.imageOptions?.imageSize || 0.4}
            logoHideBackgroundDots={qrStylingState.options.imageOptions?.hideBackgroundDots || true}
            logoMargin={qrStylingState.options.imageOptions?.margin || 0}
            onLogoChange={qrStylingState.setLogo}
            onLogoSizeChange={(size) => qrStylingState.updateImageOptions({ imageSize: size })}
            onLogoHideDotsChange={(hide) => qrStylingState.updateImageOptions({ hideBackgroundDots: hide })}
            onLogoMarginChange={(margin) => qrStylingState.updateImageOptions({ margin })}
            isPremium={isPremium}
          />
        )}
        
        {activeTab === 'frame' && (
          <FrameTab
            enabled={qrStylingState.frameOptions.enabled}
            style={qrStylingState.frameOptions.style}
            width={qrStylingState.frameOptions.width}
            color={qrStylingState.frameOptions.color}
            text={qrStylingState.frameOptions.text}
            textColor={qrStylingState.frameOptions.textColor}
            fontFamily={qrStylingState.frameOptions.fontFamily}
            onEnabledChange={(enabled) => qrStylingState.updateFrameOptions({ enabled })}
            onStyleChange={(style) => qrStylingState.updateFrameOptions({ style: style as FrameStyleType })}
            onWidthChange={(width) => qrStylingState.updateFrameOptions({ width })}
            onColorChange={(color) => qrStylingState.updateFrameOptions({ color })}
            onTextChange={(text) => qrStylingState.updateFrameOptions({ text })}
            onTextColorChange={(color) => qrStylingState.updateFrameOptions({ textColor: color })}
            onFontFamilyChange={(fontFamily) => qrStylingState.updateFrameOptions({ fontFamily })}
            isPremium={isPremium}
          />
        )}
        
        {activeTab === 'shape' && (
          <ShapeTab
            shape={qrStylingState.options.shape}
            onShapeChange={(shape) => qrStylingState.updateOptions({ shape })}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    height: 280,
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  scanMeText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    backgroundColor: '#000',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  webView: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
  },
  tabScroll: {
    maxHeight: 75,
  },
  tabContainer: {
    paddingHorizontal: 10,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 60,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
  },
  contentScroll: {
    flex: 1,
  },
});

export default QRCodeDesigner; 