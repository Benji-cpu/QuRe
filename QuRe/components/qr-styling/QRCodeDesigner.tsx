import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useQRCodeStyling } from '@/hooks/useQRCodeStyling';

import DotsTab from './tabs/DotsTab';
import CornersTab from './tabs/CornersTab';
import BackgroundTab from './tabs/BackgroundTab';
import LogoTab from './tabs/LogoTab';
import FrameTab from './tabs/FrameTab';
import ShapeTab from './tabs/ShapeTab';

type TabKey = 'dots' | 'corners' | 'background' | 'logo' | 'frame' | 'shape';
type DotsType = 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
type CornersSquareType = 'square' | 'dot' | 'extra-rounded';
type CornersDotType = 'dot' | 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
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
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const bgColor = useThemeColor({ light: '#f5f5f7', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  const qrStylingState = useQRCodeStyling(data);
  const [activeTab, setActiveTab] = useState<TabKey>('dots');
  const lastUpdateRef = useRef<number>(Date.now());
  
  useEffect(() => {
    if (onStyleChange) {
      const now = Date.now();
      if (now - lastUpdateRef.current > 50) {
        const options = {
          options: qrStylingState.options,
          frameOptions: qrStylingState.frameOptions
        };
        onStyleChange(options);
        lastUpdateRef.current = now;
      } else {
        const timeoutId = setTimeout(() => {
          const options = {
            options: qrStylingState.options,
            frameOptions: qrStylingState.frameOptions
          };
          onStyleChange(options);
          lastUpdateRef.current = Date.now();
        }, 50);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    qrStylingState.options,
    qrStylingState.frameOptions,
    onStyleChange
  ]);
  
  const dotsHasGradient = !!qrStylingState.options.dotsOptions.gradient;
  const dotsGradientType = qrStylingState.options.dotsOptions.gradient?.type || 'linear';
  const dotsGradientRotation = qrStylingState.options.dotsOptions.gradient?.rotation || 0;
  const dotsGradientStartColor = qrStylingState.options.dotsOptions.gradient?.colorStops?.[0]?.color || '#000000';
  const dotsGradientEndColor = qrStylingState.options.dotsOptions.gradient?.colorStops?.[1]?.color || '#000000';
  
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
      // Keep the original color when removing gradient
      qrStylingState.updateDotsOptions({
        color: qrStylingState.options.dotsOptions.color || '#000000',
        gradient: undefined
      });
    }
  };
  
  const squareHasGradient = !!qrStylingState.options.cornersSquareOptions.gradient;
  const squareGradientType = qrStylingState.options.cornersSquareOptions.gradient?.type || 'linear';
  const squareGradientRotation = qrStylingState.options.cornersSquareOptions.gradient?.rotation || 0;
  const squareGradientStartColor = qrStylingState.options.cornersSquareOptions.gradient?.colorStops?.[0]?.color || '#000000';
  const squareGradientEndColor = qrStylingState.options.cornersSquareOptions.gradient?.colorStops?.[1]?.color || '#000000';
  
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
  
  const dotHasGradient = !!qrStylingState.options.cornersDotOptions.gradient;
  const dotGradientType = qrStylingState.options.cornersDotOptions.gradient?.type || 'linear';
  const dotGradientRotation = qrStylingState.options.cornersDotOptions.gradient?.rotation || 0;
  const dotGradientStartColor = qrStylingState.options.cornersDotOptions.gradient?.colorStops?.[0]?.color || '#000000';
  const dotGradientEndColor = qrStylingState.options.cornersDotOptions.gradient?.colorStops?.[1]?.color || '#000000';
  
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
  
  const bgHasGradient = !!qrStylingState.options.backgroundOptions.gradient;
  const bgGradientType = qrStylingState.options.backgroundOptions.gradient?.type || 'linear';
  const bgGradientRotation = qrStylingState.options.backgroundOptions.gradient?.rotation || 0;
  const bgGradientStartColor = qrStylingState.options.backgroundOptions.gradient?.colorStops?.[0]?.color || '#ffffff';
  const bgGradientEndColor = qrStylingState.options.backgroundOptions.gradient?.colorStops?.[1]?.color || '#ffffff';
  const isBgTransparent = qrStylingState.options.backgroundOptions.color === 'transparent';
  
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
  
  const updateBgTransparency = (isTransparent: boolean) => {
    qrStylingState.updateBackgroundOptions({
      color: isTransparent ? 'transparent' : '#ffffff'
    });
  };
  
  return (
    <View style={styles.container} testID="qr-code-designer">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'dots' && [styles.activeTab, { borderColor: tintColor }]
          ]}
          onPress={() => setActiveTab('dots')}
          testID="tab-dots"
        >
          <Text style={styles.tabIcon}>••••</Text>
          <Text 
            style={[
              styles.tabLabel, 
              { color: textColor },
              activeTab === 'dots' && { color: tintColor }
            ]}
          >
            Dots
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'corners' && [styles.activeTab, { borderColor: tintColor }]
          ]}
          onPress={() => setActiveTab('corners')}
          testID="tab-corners"
        >
          <Text style={styles.tabIcon}>⬣</Text>
          <Text 
            style={[
              styles.tabLabel, 
              { color: textColor },
              activeTab === 'corners' && { color: tintColor }
            ]}
          >
            Corners
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'background' && [styles.activeTab, { borderColor: tintColor }]
          ]}
          onPress={() => setActiveTab('background')}
          testID="tab-background"
        >
          <Text style={styles.tabIcon}>🎨</Text>
          <Text 
            style={[
              styles.tabLabel, 
              { color: textColor },
              activeTab === 'background' && { color: tintColor }
            ]}
          >
            Background
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'logo' && [styles.activeTab, { borderColor: tintColor }]
          ]}
          onPress={() => setActiveTab('logo')}
          testID="tab-logo"
        >
          <Text style={styles.tabIcon}>🖼️</Text>
          <Text 
            style={[
              styles.tabLabel, 
              { color: textColor },
              activeTab === 'logo' && { color: tintColor }
            ]}
          >
            Logo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'frame' && [styles.activeTab, { borderColor: tintColor }]
          ]}
          onPress={() => setActiveTab('frame')}
          testID="tab-frame"
        >
          <Text style={styles.tabIcon}>▢</Text>
          <Text 
            style={[
              styles.tabLabel, 
              { color: textColor },
              activeTab === 'frame' && { color: tintColor }
            ]}
          >
            Frame
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'shape' && [styles.activeTab, { borderColor: tintColor }]
          ]}
          onPress={() => setActiveTab('shape')}
          testID="tab-shape"
        >
          <Text style={styles.tabIcon}>◯</Text>
          <Text 
            style={[
              styles.tabLabel, 
              { color: textColor },
              activeTab === 'shape' && { color: tintColor }
            ]}
          >
            Shape
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
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
            squareType={qrStylingState.options.cornersSquareOptions.type}
            squareColor={qrStylingState.options.cornersSquareOptions.color}
            squareHasGradient={squareHasGradient}
            squareGradientType={squareGradientType}
            squareGradientStartColor={squareGradientStartColor}
            squareGradientEndColor={squareGradientEndColor}
            squareGradientRotation={squareGradientRotation}
            
            dotType={qrStylingState.options.cornersDotOptions.type}
            dotColor={qrStylingState.options.cornersDotOptions.color}
            dotHasGradient={dotHasGradient}
            dotGradientType={dotGradientType}
            dotGradientStartColor={dotGradientStartColor}
            dotGradientEndColor={dotGradientEndColor}
            dotGradientRotation={dotGradientRotation}
            
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
    paddingBottom: 20,
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