/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Define the type for a single gradient array
type GradientColors = readonly [string, string, ...string[]];

// Define the type for the Gradients object
interface GradientCollection {
  [key: string]: GradientColors;
}

export const Gradients: GradientCollection = {
  Sunset: ['#FF6B6B', '#FFA07A', '#FFD700'], // Reddish-Orange to Gold
  OceanBreeze: ['#00BFFF', '#87CEFA', '#ADD8E6'], // Deep Sky Blue to Light Blue
  NeonDream: ['#FF00FF', '#00FFFF', '#FFFF00'], // Magenta to Cyan to Yellow
  PastelHarmony: ['#FFB6C1', '#AFEEEE', '#98FB98'], // Light Pink to Pale Turquoise to Pale Green
  DynamicTrio: ['#FF4500', '#1E90FF', '#32CD32'], // OrangeRed to DodgerBlue to LimeGreen
};
