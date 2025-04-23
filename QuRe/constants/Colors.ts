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

// Updated Gradients with BlueScreen as the first option to match the mockup
export const Gradients: GradientCollection = {
  // Add BlueScreen as the first gradient to be the default
  BlueScreen: ['#0056D6', '#0A84FF'],
  Sunset: ['#ff6029', '#faa4d1'],
  OceanBreeze: ['#2328ff', '#a1ffaa'],
  NeonDream: ['#4bff8f', '#ebff11'],
  PastelHarmony: ['#e9fc88', '#edb4f8'],
  DynamicTrio: ['#ff295b', '#ff77f4', '#4537ff'], // This one has three colors
};