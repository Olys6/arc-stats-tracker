import { createAnimations } from '@tamagui/animations-react-native';
import { createTamagui, createTokens } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';

const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 120,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
});

const headingFont = createInterFont({
  size: {
    6: 15,
    7: 18,
    8: 21,
    9: 24,
    10: 30,
  },
  weight: {
    6: '600',
    7: '700',
  },
  letterSpacing: {
    5: 0,
    6: -0.5,
    7: -0.5,
    8: -1,
  },
});

const bodyFont = createInterFont(
  {
    weight: {
      1: '400',
      2: '500',
      3: '600',
    },
  },
  { sizeLineHeight: (size) => size + 6 }
);

// Arc Raiders color palette - based on official branding
const arcColors = {
  // Base colors
  background: '#0a0a0b',
  surface: '#1a1a1c',
  surfaceHover: '#222225',
  subtle: '#2a2a2e',
  border: '#3a3a3e',

  // Primary (cyan from Arc Raiders logo)
  primary: '#00d4ff',
  primaryHover: '#33ddff',
  primaryDark: '#00a8cc',

  // Secondary colors from logo
  arcGreen: '#00ff66',
  arcYellow: '#ffdd00',
  arcOrange: '#ff8800',
  arcRed: '#ff2200',

  // Success (green from logo)
  success: '#00ff66',
  successHover: '#33ff88',
  successDark: '#00cc52',

  // Danger (red from logo)
  danger: '#ff2200',
  dangerHover: '#ff5544',
  dangerDark: '#cc1a00',

  // Text
  text: '#e4e4e7',
  textMuted: '#71717a',
  textDim: '#52525b',
};

const tokens = createTokens({
  size: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    4.5: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    13: 52,
    14: 56,
    15: 60,
    16: 64,
    17: 68,
    18: 72,
    19: 76,
    20: 80,
    true: 16,
  },
  space: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    4.5: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    true: 16,
    '-0.5': -2,
    '-1': -4,
    '-1.5': -6,
    '-2': -8,
    '-2.5': -10,
    '-3': -12,
    '-3.5': -14,
    '-4': -16,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    true: 8,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  color: {
    ...arcColors,
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },
});

const darkTheme = {
  background: tokens.color.background,
  backgroundHover: tokens.color.surface,
  backgroundPress: tokens.color.surfaceHover,
  backgroundFocus: tokens.color.surface,

  color: tokens.color.text,
  colorHover: tokens.color.text,
  colorPress: tokens.color.textMuted,
  colorFocus: tokens.color.text,

  borderColor: tokens.color.border,
  borderColorHover: tokens.color.subtle,
  borderColorFocus: tokens.color.primary,
  borderColorPress: tokens.color.border,

  placeholderColor: tokens.color.textDim,

  // Semantic colors
  primary: tokens.color.primary,
  primaryHover: tokens.color.primaryHover,

  success: tokens.color.success,
  successHover: tokens.color.successHover,

  danger: tokens.color.danger,
  dangerHover: tokens.color.dangerHover,

  // Surface colors
  surface: tokens.color.surface,
  surfaceHover: tokens.color.surfaceHover,
  subtle: tokens.color.subtle,

  // Text variants
  textMuted: tokens.color.textMuted,
  textDim: tokens.color.textDim,
};

export const config = createTamagui({
  animations,
  defaultTheme: 'dark',
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    dark: darkTheme,
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

export default config;

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
